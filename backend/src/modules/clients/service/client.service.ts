import { ClientStatus, AuditAction, AuditModule, AuditStatus, AuditSeverity } from '@prisma/client';
import { IClientRepository } from '../repository/client.repository.interface';
import { IUserRepository } from '../../users/repositories/user.repository.interface';
import { IAuditLogService } from '../../audit-logs/service/audit-log.service';
import {
  ClientDetailOutput,
  PaginatedClientsOutput,
  ClientFiltersInput,
} from '../repository/client.repository.types';
import { IClientService } from './client.service.interface';
import {
  CreateClientServiceInput,
  UpdateClientServiceInput,
  FindClientsServiceOptions,
} from './client.service.types';
import {
  ClientServiceError,
  ClientNotFoundError,
  ClientAlreadyExistsError,
  ClientArchivedError,
  InvalidStatusTransitionError,
  AccountManagerNotFoundError,
} from './client.service.errors';

/**
 * Concrete implementation of Clients Business Service.
 * Implements IClientService contract.
 */
export class ClientService implements IClientService {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogService: IAuditLogService
  ) {}

  /**
   * Creates a new client record, validates unique constraints, and writes an audit log.
   */
  public async createClient(
    data: CreateClientServiceInput,
    currentUserId: string
  ): Promise<ClientDetailOutput> {
    try {
      const codeExists = await this.clientRepository.existsByCode(data.code);
      if (codeExists) {
        throw new ClientAlreadyExistsError(data.code);
      }

      if (data.accountManagerId) {
        const manager = await this.userRepository.findUserById(data.accountManagerId);
        if (!manager) {
          throw new AccountManagerNotFoundError(data.accountManagerId);
        }
      }

      const client = await this.clientRepository.create({
        ...data,
        createdById: currentUserId,
      });

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.CREATE,
          module: AuditModule.CLIENTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Client',
          entityId: client.id,
          resourceName: client.name,
          newValues: {
            id: client.id,
            code: client.code,
            name: client.name,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for client creation:', auditError);
      }

      return client;
    } catch (error) {
      if (error instanceof ClientServiceError) {
        throw error;
      }
      throw new ClientServiceError(`Failed to create client: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves a client by unique ID. Excludes soft-deleted records by default.
   */
  public async getClientById(id: string): Promise<ClientDetailOutput> {
    try {
      const client = await this.clientRepository.findById(id);
      if (!client) {
        throw new ClientNotFoundError(id);
      }
      return client;
    } catch (error) {
      if (error instanceof ClientServiceError) {
        throw error;
      }
      throw new ClientServiceError(
        `Failed to retrieve client by ID ${id}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Retrieves a client by unique code. Excludes soft-deleted records by default.
   */
  public async getClientByCode(code: string): Promise<ClientDetailOutput> {
    try {
      const client = await this.clientRepository.findByCode(code);
      if (!client) {
        throw new ClientNotFoundError(code);
      }
      return client;
    } catch (error) {
      if (error instanceof ClientServiceError) {
        throw error;
      }
      throw new ClientServiceError(
        `Failed to retrieve client by code ${code}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Searches, filters, and paginates client summaries.
   */
  public async listClients(options: FindClientsServiceOptions): Promise<PaginatedClientsOutput> {
    try {
      return await this.clientRepository.findMany(options);
    } catch (error) {
      throw new ClientServiceError(`Failed to list clients: ${(error as Error).message}`);
    }
  }

  /**
   * Counts the clients matching filter criteria.
   */
  public async countClients(filters: ClientFiltersInput): Promise<number> {
    try {
      return await this.clientRepository.count(filters);
    } catch (error) {
      throw new ClientServiceError(`Failed to count clients: ${(error as Error).message}`);
    }
  }

  /**
   * Updates an existing active client profile and writes an audit log.
   */
  public async updateClient(
    id: string,
    data: UpdateClientServiceInput,
    currentUserId: string
  ): Promise<ClientDetailOutput> {
    try {
      const existingClient = await this.clientRepository.findById(id);
      if (!existingClient) {
        throw new ClientNotFoundError(id);
      }

      if (existingClient.status === ClientStatus.ARCHIVED || existingClient.deletedAt !== null) {
        throw new ClientArchivedError(id);
      }

      if (data.code && data.code !== existingClient.code) {
        const codeClient = await this.clientRepository.findByCode(data.code);
        if (codeClient && codeClient.id !== id) {
          throw new ClientAlreadyExistsError(data.code);
        }
      }

      if (data.accountManagerId && data.accountManagerId !== existingClient.accountManagerId) {
        const manager = await this.userRepository.findUserById(data.accountManagerId);
        if (!manager) {
          throw new AccountManagerNotFoundError(data.accountManagerId);
        }
      }

      // Prevent direct modification of status to ARCHIVED here to force the archiveClient flow
      if (data.status === ClientStatus.ARCHIVED) {
        throw new InvalidStatusTransitionError(
          'Direct status update to ARCHIVED is restricted. Use the archiveClient method instead.'
        );
      }

      const updated = await this.clientRepository.update(id, {
        ...data,
        updatedById: currentUserId,
      });

      if (!updated) {
        throw new ClientNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.CLIENTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Client',
          entityId: updated.id,
          resourceName: updated.name,
          oldValues: {
            code: existingClient.code,
            name: existingClient.name,
            status: existingClient.status,
          },
          newValues: {
            code: updated.code,
            name: updated.name,
            status: updated.status,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for client update:', auditError);
      }

      return updated;
    } catch (error) {
      if (error instanceof ClientServiceError) {
        throw error;
      }
      throw new ClientServiceError(`Failed to update client ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Soft deletes / archives a client, ensuring they are not already archived.
   */
  public async archiveClient(id: string, currentUserId: string): Promise<ClientDetailOutput> {
    try {
      const client = await this.clientRepository.findById(id);
      if (!client) {
        throw new ClientNotFoundError(id);
      }

      if (client.status === ClientStatus.ARCHIVED || client.deletedAt !== null) {
        throw new InvalidStatusTransitionError(`Client ${id} is already archived.`);
      }

      const deleted = await this.clientRepository.softDelete(id);
      if (!deleted) {
        throw new ClientNotFoundError(id);
      }

      const updatedClient = await this.clientRepository.findById(id, { includeDeleted: true });
      if (!updatedClient) {
        throw new ClientNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.DELETE,
          module: AuditModule.CLIENTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Client',
          entityId: id,
          resourceName: client.name,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for client archiving:', auditError);
      }

      return updatedClient;
    } catch (error) {
      if (error instanceof ClientServiceError) {
        throw error;
      }
      throw new ClientServiceError(`Failed to archive client ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Restores a soft-deleted client back to ACTIVE status.
   */
  public async restoreClient(id: string, currentUserId: string): Promise<ClientDetailOutput> {
    try {
      const client = await this.clientRepository.findById(id, { includeDeleted: true });
      if (!client) {
        throw new ClientNotFoundError(id);
      }

      if (client.status !== ClientStatus.ARCHIVED && client.deletedAt === null) {
        throw new InvalidStatusTransitionError(`Client ${id} is already active.`);
      }

      const restored = await this.clientRepository.update(id, {
        deletedAt: null,
        status: ClientStatus.ACTIVE,
        updatedById: currentUserId,
      });

      if (!restored) {
        throw new ClientNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.CLIENTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Client',
          entityId: id,
          resourceName: restored.name,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for client restoration:', auditError);
      }

      return restored;
    } catch (error) {
      if (error instanceof ClientServiceError) {
        throw error;
      }
      throw new ClientServiceError(`Failed to restore client ${id}: ${(error as Error).message}`);
    }
  }
}
