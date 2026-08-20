import { PrismaClient, AuditAction, AuditModule, AuditStatus, AuditSeverity } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ILeadRepository } from '../repository/lead.repository.interface';
import { IUserRepository } from '../../users/repositories/user.repository.interface';
import { IAuditLogService } from '../../audit-logs/service/audit-log.service';
import {
  LeadDetailOutput,
  PaginatedLeadsOutput,
  LeadFiltersInput,
} from '../repository/lead.repository.types';
import { ILeadService } from './lead.service.interface';
import {
  CreateLeadServiceInput,
  UpdateLeadServiceInput,
  FindLeadsServiceOptions,
} from './lead.service.types';
import {
  LeadServiceError,
  LeadNotFoundError,
  LeadArchivedError,
  InvalidStatusTransitionError,
  LeadAssigneeNotFoundError,
} from './lead.service.errors';

/**
 * Concrete implementation of Leads Business Service.
 * Implements ILeadService contract, coordinating data validation, audit trail entries,
 * user relationship checks, and soft delete state workflows.
 */
export class LeadService implements ILeadService {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogService: IAuditLogService,
    private readonly prisma: PrismaClient
  ) {}

  /**
   * Creates a new lead record, validates unique constraints (email uniqueness), and writes an audit log.
   */
  public async createLead(
    data: CreateLeadServiceInput,
    currentUserId?: string
  ): Promise<LeadDetailOutput> {
    try {
      if (data.assignedToId) {
        const assignee = await this.userRepository.findUserById(data.assignedToId);
        if (!assignee || assignee.status !== 'ACTIVE') {
          throw new LeadAssigneeNotFoundError(data.assignedToId);
        }
      }

      const created = await this.leadRepository.create({
        ...data,
        createdById: currentUserId || null,
      });

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.CREATE,
          module: AuditModule.LEADS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId || null,
          entityType: 'Lead',
          entityId: created.id,
          resourceName: created.name,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for lead creation:', auditError);
      }

      return created;
    } catch (error) {
      if (error instanceof LeadServiceError) {
        throw error;
      }
      throw new LeadServiceError(`Failed to create lead: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves a lead by unique ID. Excludes soft-deleted records by default.
   */
  public async getLeadById(id: string): Promise<LeadDetailOutput> {
    try {
      const lead = await this.leadRepository.findById(id);
      if (!lead) {
        throw new LeadNotFoundError(id);
      }
      return lead;
    } catch (error) {
      if (error instanceof LeadServiceError) {
        throw error;
      }
      throw new LeadServiceError(`Failed to fetch lead ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves a lead by unique email. Excludes soft-deleted records by default.
   */
  public async getLeadByEmail(email: string): Promise<LeadDetailOutput> {
    try {
      const lead = await this.leadRepository.findByEmail(email);
      if (!lead) {
        throw new LeadNotFoundError(email);
      }
      return lead;
    } catch (error) {
      if (error instanceof LeadServiceError) {
        throw error;
      }
      throw new LeadServiceError(
        `Failed to fetch lead by email ${email}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Searches, filters, and paginates lead summaries.
   */
  public async listLeads(options: FindLeadsServiceOptions): Promise<PaginatedLeadsOutput> {
    try {
      return await this.leadRepository.findMany(options);
    } catch (error) {
      throw new LeadServiceError(`Failed to list leads: ${(error as Error).message}`);
    }
  }

  /**
   * Updates an existing active lead profile and writes an audit log.
   */
  public async updateLead(
    id: string,
    data: UpdateLeadServiceInput,
    currentUserId: string
  ): Promise<LeadDetailOutput> {
    try {
      const existingLead = await this.leadRepository.findById(id);
      if (!existingLead) {
        throw new LeadNotFoundError(id);
      }

      if (existingLead.deletedAt !== null) {
        throw new LeadArchivedError(id);
      }

      if (data.assignedToId && data.assignedToId !== existingLead.assignedToId) {
        const assignee = await this.userRepository.findUserById(data.assignedToId);
        if (!assignee || assignee.status !== 'ACTIVE') {
          throw new LeadAssigneeNotFoundError(data.assignedToId);
        }
      }

      const updated = await this.leadRepository.update(id, {
        ...data,
        updatedById: currentUserId,
      });

      if (!updated) {
        throw new LeadNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.LEADS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Lead',
          entityId: updated.id,
          resourceName: updated.name,
          oldValues: {
            name: existingLead.name,
            status: existingLead.status,
            priority: existingLead.priority,
          },
          newValues: {
            name: updated.name,
            status: updated.status,
            priority: updated.priority,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for lead update:', auditError);
      }

      return updated;
    } catch (error) {
      if (error instanceof LeadServiceError) {
        throw error;
      }
      throw new LeadServiceError(`Failed to update lead ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Soft deletes / archives a lead, ensuring it is not already archived.
   */
  public async archiveLead(id: string, currentUserId: string): Promise<LeadDetailOutput> {
    try {
      const lead = await this.leadRepository.findById(id);
      if (!lead) {
        throw new LeadNotFoundError(id);
      }

      if (lead.deletedAt !== null) {
        throw new InvalidStatusTransitionError(`Lead ${id} is already archived.`);
      }

      const deleted = await this.leadRepository.softDelete(id);
      if (!deleted) {
        throw new LeadNotFoundError(id);
      }

      const updatedLead = await this.leadRepository.findById(id, { includeDeleted: true });
      if (!updatedLead) {
        throw new LeadNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.DELETE,
          module: AuditModule.LEADS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Lead',
          entityId: id,
          resourceName: lead.name,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for lead archiving:', auditError);
      }

      return updatedLead;
    } catch (error) {
      if (error instanceof LeadServiceError) {
        throw error;
      }
      throw new LeadServiceError(`Failed to archive lead ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Restores a soft-deleted lead back to active status.
   */
  public async restoreLead(id: string, currentUserId: string): Promise<LeadDetailOutput> {
    try {
      const lead = await this.leadRepository.findById(id, { includeDeleted: true });
      if (!lead) {
        throw new LeadNotFoundError(id);
      }

      if (lead.deletedAt === null) {
        throw new InvalidStatusTransitionError(`Lead ${id} is already active.`);
      }

      const restored = await this.leadRepository.restore(id);

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.LEADS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Lead',
          entityId: id,
          resourceName: restored.name,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for lead restoration:', auditError);
      }

      return restored;
    } catch (error) {
      if (error instanceof LeadServiceError) {
        throw error;
      }
      throw new LeadServiceError(`Failed to restore lead ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Counts the leads matching filter criteria.
   */
  public async countLeads(filters: LeadFiltersInput): Promise<number> {
    try {
      return await this.leadRepository.count(filters);
    } catch (error) {
      throw new LeadServiceError(`Failed to count leads: ${(error as Error).message}`);
    }
  }

  public async approveLeadAndProvisionClient(
    leadId: string,
    currentUserId: string,
    password?: string
  ): Promise<{
    lead: LeadDetailOutput;
    user: { id: string; email: string; displayName: string };
    client: { id: string; name: string; code: string };
    initialPassword: string;
  }> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new LeadNotFoundError(leadId);
    }

    if (!lead.email) {
      throw new LeadServiceError('Lead record does not have a valid email address for provisioning.');
    }

    const targetEmail = lead.email.trim().toLowerCase();
    const initialPassword = password || 'Client@123';

    try {
      const result = await this.prisma.$transaction(async (tx: any) => {
        // 1. Check or create User
        let existingUser = await tx.user.findFirst({
          where: { email: targetEmail },
        });

        if (!existingUser) {
          const nameParts = (lead.name || 'Client User').trim().split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || '';

          existingUser = await tx.user.create({
            data: {
              firstName,
              lastName,
              displayName: lead.name,
              email: targetEmail,
              emailVerified: true,
              status: 'ACTIVE',
            },
          });

          const passwordHash = await bcrypt.hash(initialPassword, 12);
          await tx.credential.create({
            data: {
              userId: existingUser.id,
              passwordHash,
              passwordChangedAt: new Date(),
            },
          });

          const clientRole = await tx.role.findFirst({
            where: { code: 'CLIENT' },
          });

          if (clientRole) {
            await tx.userRole.upsert({
              where: {
                userId_roleId: {
                  userId: existingUser.id,
                  roleId: clientRole.id,
                },
              },
              update: { isActive: true },
              create: {
                userId: existingUser.id,
                roleId: clientRole.id,
                isActive: true,
              },
            });
          }
        }

        // 2. Check or create Client organization
        const orgName = lead.companyName || lead.name;
        let existingClient = await tx.client.findFirst({
          where: {
            deletedAt: null,
            OR: [{ email: targetEmail }, { name: orgName }],
          },
        });

        if (!existingClient) {
          const codePrefix = orgName
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 10) || 'CLIENT';
          const code = `${codePrefix}_${Date.now().toString().slice(-4)}`;

          existingClient = await tx.client.create({
            data: {
              name: orgName,
              code,
              email: targetEmail,
              phone: lead.phone || null,
              status: 'ACTIVE',
              createdById: currentUserId,
            },
          });
        }

        // 3. Update Lead status to QUALIFIED
        const updatedLead = await tx.lead.update({
          where: { id: leadId },
          data: {
            status: 'QUALIFIED',
            notes: lead.notes
              ? `${lead.notes}\n[Approved & Provisioned as Client Account]`
              : '[Approved & Provisioned as Client Account]',
            updatedById: currentUserId,
          },
        });

        // 4. Create Audit Log
        await tx.auditLog.create({
          data: {
            action: AuditAction.CREATE,
            module: AuditModule.CLIENTS,
            status: AuditStatus.SUCCESS,
            severity: AuditSeverity.INFO,
            userId: currentUserId,
            entityType: 'Client',
            entityId: existingClient.id,
            resourceName: existingClient.name,
          },
        });

        return {
          updatedLead,
          user: existingUser,
          client: existingClient,
        };
      });

      const leadDetail = await this.leadRepository.findById(leadId);

      return {
        lead: leadDetail || (result.updatedLead as unknown as LeadDetailOutput),
        user: {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
        },
        client: {
          id: result.client.id,
          name: result.client.name,
          code: result.client.code,
        },
        initialPassword,
      };
    } catch (error) {
      if (error instanceof LeadServiceError) {
        throw error;
      }
      throw new LeadServiceError(`Failed to approve lead & provision client: ${(error as Error).message}`);
    }
  }
}
