import { AuditAction, AuditModule, AuditStatus, AuditSeverity } from '@prisma/client';
import { ITicketRepository } from '../repository/ticket.repository.interface';
import { IUserRepository } from '../../users/repositories/user.repository.interface';
import { IClientRepository } from '../../clients/repository/client.repository.interface';
import { IProjectRepository } from '../../projects/repository/project.repository.interface';
import { IAuditLogService } from '../../audit-logs/service/audit-log.service';
import {
  TicketDetailOutput,
  TicketCommentOutput,
  PaginatedTicketsOutput,
  TicketFiltersInput,
} from '../repository/ticket.repository.types';
import { ITicketService } from './ticket.service.interface';
import {
  CreateTicketServiceInput,
  UpdateTicketServiceInput,
  FindTicketsServiceOptions,
} from './ticket.service.types';
import {
  TicketServiceError,
  TicketNotFoundError,
  TicketArchivedError,
  InvalidStatusTransitionError,
  TicketAssigneeNotFoundError,
  ClientNotFoundError,
  ClientArchivedError,
  ProjectNotFoundError,
  ProjectArchivedError,
} from './ticket.service.errors';

/**
 * Concrete implementation of Tickets Business Service.
 * Coordinates database actions via ITicketRepository, audits write operations,
 * and validates linked User, Client, and Project statuses.
 */
export class TicketService implements ITicketService {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly userRepository: IUserRepository,
    private readonly clientRepository: IClientRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly auditLogService: IAuditLogService
  ) {}

  /**
   * Persists a new Ticket record after validating referenced entities.
   */
  public async createTicket(
    data: CreateTicketServiceInput,
    currentUserId: string
  ): Promise<TicketDetailOutput> {
    try {
      // 1. Validate assignee user exists and is active
      if (data.assignedToId) {
        const assignee = await this.userRepository.findUserById(data.assignedToId);
        if (!assignee || assignee.status !== 'ACTIVE') {
          throw new TicketAssigneeNotFoundError(data.assignedToId);
        }
      }

      // 2. Validate referenced client exists and is active
      if (data.clientId) {
        const client = await this.clientRepository.findById(data.clientId);
        if (!client) {
          throw new ClientNotFoundError(data.clientId);
        }
        if (client.deletedAt !== null || client.status === 'ARCHIVED') {
          throw new ClientArchivedError(data.clientId);
        }
      }

      // 3. Validate referenced project exists and is active
      if (data.projectId) {
        const project = await this.projectRepository.findById(data.projectId);
        if (!project) {
          throw new ProjectNotFoundError(data.projectId);
        }
        if (project.deletedAt !== null || project.status === 'ARCHIVED') {
          throw new ProjectArchivedError(data.projectId);
        }
      }

      const created = await this.ticketRepository.create({
        ...data,
        createdById: currentUserId,
      });

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.CREATE,
          module: AuditModule.SUPPORT,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Ticket',
          entityId: created.id,
          resourceName: created.subject,
          newValues: {
            id: created.id,
            subject: created.subject,
            status: created.status,
            priority: created.priority,
            assignedToId: created.assignedToId,
            clientId: created.clientId,
            projectId: created.projectId,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for ticket creation:', auditError);
      }

      return created;
    } catch (error) {
      if (error instanceof TicketServiceError) {
        throw error;
      }
      throw new TicketServiceError(`Failed to create ticket: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves a Ticket by unique ID. Excludes soft-deleted records by default.
   */
  public async getTicketById(id: string): Promise<TicketDetailOutput> {
    try {
      const ticket = await this.ticketRepository.findById(id);
      if (!ticket) {
        throw new TicketNotFoundError(id);
      }
      return ticket;
    } catch (error) {
      if (error instanceof TicketServiceError) {
        throw error;
      }
      throw new TicketServiceError(`Failed to fetch ticket ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Lists, filters, and paginates Tickets.
   */
  public async listTickets(options: FindTicketsServiceOptions): Promise<PaginatedTicketsOutput> {
    try {
      return await this.ticketRepository.findMany(options);
    } catch (error) {
      throw new TicketServiceError(`Failed to list tickets: ${(error as Error).message}`);
    }
  }

  /**
   * Updates an existing active Ticket record after validating reference updates.
   */
  public async updateTicket(
    id: string,
    data: UpdateTicketServiceInput,
    currentUserId: string
  ): Promise<TicketDetailOutput> {
    try {
      const existingTicket = await this.ticketRepository.findById(id);
      if (!existingTicket) {
        throw new TicketNotFoundError(id);
      }

      if (existingTicket.deletedAt !== null) {
        throw new TicketArchivedError(id);
      }

      // 1. Validate assignee user if changed
      if (data.assignedToId && data.assignedToId !== existingTicket.assignedToId) {
        const assignee = await this.userRepository.findUserById(data.assignedToId);
        if (!assignee || assignee.status !== 'ACTIVE') {
          throw new TicketAssigneeNotFoundError(data.assignedToId);
        }
      }

      // 2. Validate referenced client if changed
      if (data.clientId && data.clientId !== existingTicket.clientId) {
        const client = await this.clientRepository.findById(data.clientId);
        if (!client) {
          throw new ClientNotFoundError(data.clientId);
        }
        if (client.deletedAt !== null || client.status === 'ARCHIVED') {
          throw new ClientArchivedError(data.clientId);
        }
      }

      // 3. Validate referenced project if changed
      if (data.projectId && data.projectId !== existingTicket.projectId) {
        const project = await this.projectRepository.findById(data.projectId);
        if (!project) {
          throw new ProjectNotFoundError(data.projectId);
        }
        if (project.deletedAt !== null || project.status === 'ARCHIVED') {
          throw new ProjectArchivedError(data.projectId);
        }
      }

      const updated = await this.ticketRepository.update(id, {
        ...data,
        updatedById: currentUserId,
      });

      if (!updated) {
        throw new TicketNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.SUPPORT,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Ticket',
          entityId: updated.id,
          resourceName: updated.subject,
          oldValues: {
            subject: existingTicket.subject,
            status: existingTicket.status,
            priority: existingTicket.priority,
            assignedToId: existingTicket.assignedToId,
            clientId: existingTicket.clientId,
            projectId: existingTicket.projectId,
          },
          newValues: {
            subject: updated.subject,
            status: updated.status,
            priority: updated.priority,
            assignedToId: updated.assignedToId,
            clientId: updated.clientId,
            projectId: updated.projectId,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for ticket update:', auditError);
      }

      return updated;
    } catch (error) {
      if (error instanceof TicketServiceError) {
        throw error;
      }
      throw new TicketServiceError(`Failed to update ticket ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Soft deletes / archives a Ticket, ensuring it is not already archived.
   */
  public async archiveTicket(id: string, currentUserId: string): Promise<TicketDetailOutput> {
    try {
      const ticket = await this.ticketRepository.findById(id);
      if (!ticket) {
        throw new TicketNotFoundError(id);
      }

      if (ticket.deletedAt !== null) {
        throw new InvalidStatusTransitionError(`Ticket ${id} is already archived.`);
      }

      const deleted = await this.ticketRepository.softDelete(id);
      if (!deleted) {
        throw new TicketNotFoundError(id);
      }

      const updatedTicket = await this.ticketRepository.findById(id, { includeDeleted: true });
      if (!updatedTicket) {
        throw new TicketNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.DELETE,
          module: AuditModule.SUPPORT,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Ticket',
          entityId: id,
          resourceName: ticket.subject,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for ticket archiving:', auditError);
      }

      return updatedTicket;
    } catch (error) {
      if (error instanceof TicketServiceError) {
        throw error;
      }
      throw new TicketServiceError(`Failed to archive ticket ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Restores a soft-deleted Ticket back to active status.
   */
  public async restoreTicket(id: string, currentUserId: string): Promise<TicketDetailOutput> {
    try {
      const ticket = await this.ticketRepository.findById(id, { includeDeleted: true });
      if (!ticket) {
        throw new TicketNotFoundError(id);
      }

      if (ticket.deletedAt === null) {
        throw new InvalidStatusTransitionError(`Ticket ${id} is already active.`);
      }

      const restored = await this.ticketRepository.restore(id);

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.SUPPORT,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Ticket',
          entityId: id,
          resourceName: restored.subject,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for ticket restoration:', auditError);
      }

      return restored;
    } catch (error) {
      if (error instanceof TicketServiceError) {
        throw error;
      }
      throw new TicketServiceError(`Failed to restore ticket ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Counts Tickets matching query filter.
   */
  public async countTickets(filters: TicketFiltersInput): Promise<number> {
    try {
      return await this.ticketRepository.count(filters);
    } catch (error) {
      throw new TicketServiceError(`Failed to count tickets: ${(error as Error).message}`);
    }
  }

  /**
   * Adds a comment to a ticket.
   */
  public async addComment(
    ticketId: string,
    userId: string,
    message: string,
    isInternal?: boolean
  ): Promise<TicketCommentOutput> {
    try {
      const ticket = await this.ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new TicketNotFoundError(ticketId);
      }

      if (ticket.deletedAt !== null) {
        throw new TicketArchivedError(ticketId);
      }

      const comment = await this.ticketRepository.createComment({
        ticketId,
        userId,
        message,
        isInternal: isInternal ?? false,
      });

      // Audit log entry
      try {
        await this.auditLogService.record({
          action: AuditAction.CREATE,
          module: AuditModule.SUPPORT,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId,
          entityType: 'TicketComment',
          entityId: comment.id,
          resourceName: ticket.subject,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for ticket comment:', auditError);
      }

      return comment;
    } catch (error) {
      if (error instanceof TicketServiceError) {
        throw error;
      }
      throw new TicketServiceError(`Failed to add comment to ticket ${ticketId}: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves comments for a ticket.
   */
  public async getComments(
    ticketId: string,
    options?: { includeInternal?: boolean }
  ): Promise<TicketCommentOutput[]> {
    try {
      const ticket = await this.ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new TicketNotFoundError(ticketId);
      }

      return await this.ticketRepository.findCommentsByTicketId(ticketId, options);
    } catch (error) {
      if (error instanceof TicketServiceError) {
        throw error;
      }
      throw new TicketServiceError(`Failed to fetch comments for ticket ${ticketId}: ${(error as Error).message}`);
    }
  }
}
