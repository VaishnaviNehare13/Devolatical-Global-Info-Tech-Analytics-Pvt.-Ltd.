import {
  Prisma,
  AuditAction,
  AuditModule,
  AuditStatus,
  AuditSeverity,
  MilestoneStatus,
} from '@prisma/client';
import { IMilestoneRepository } from '../repository/milestone.repository.interface';
import { IProjectRepository } from '../../projects/repository/project.repository.interface';
import { IAuditLogService } from '../../audit-logs/service/audit-log.service';
import {
  MilestoneDetailOutput,
  PaginatedMilestonesOutput,
  MilestoneFiltersInput,
} from '../repository/milestone.repository.types';
import { IMilestoneService } from './milestone.service.interface';
import {
  CreateMilestoneServiceInput,
  UpdateMilestoneServiceInput,
  FindMilestonesServiceOptions,
} from './milestone.service.types';
import {
  MilestoneServiceError,
  MilestoneNotFoundError,
  MilestoneAlreadyExistsError,
  MilestoneArchivedError,
  InvalidStatusTransitionError,
  ProjectNotFoundError,
  ProjectArchivedError,
} from './milestone.service.errors';

export class MilestoneService implements IMilestoneService {
  constructor(
    private readonly milestoneRepository: IMilestoneRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async createMilestone(
    data: CreateMilestoneServiceInput,
    currentUserId: string
  ): Promise<MilestoneDetailOutput> {
    try {
      // 1. Project Existence Validation
      const project = await this.projectRepository.findById(data.projectId);
      if (!project) {
        throw new ProjectNotFoundError(data.projectId);
      }

      // 2. Project Archived Check
      if (project.deletedAt !== null || project.status === 'ARCHIVED') {
        throw new ProjectArchivedError(data.projectId);
      }

      // 3. Duplicate Check
      const existing = await this.milestoneRepository.findByTitleInProject(
        data.title,
        data.projectId
      );
      if (existing) {
        throw new MilestoneAlreadyExistsError(data.title, data.projectId);
      }

      // 4. Status completion date handling
      const status = data.status ?? MilestoneStatus.PENDING;
      const completedAt = status === MilestoneStatus.COMPLETED ? new Date() : null;

      const result = await this.milestoneRepository.create({
        ...data,
        status,
        createdById: currentUserId,
      });

      // Update completedAt if status was COMPLETED
      let finalResult = result;
      if (completedAt) {
        const updated = await this.milestoneRepository.update(result.id, {
          completedAt,
        });
        if (updated) {
          finalResult = updated;
        }
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.CREATE,
          module: AuditModule.MILESTONES,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Milestone',
          entityId: finalResult.id,
          resourceName: finalResult.title,
          newValues: finalResult as unknown as Prisma.InputJsonValue,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for milestone creation:', auditError);
      }

      return finalResult;
    } catch (error) {
      if (error instanceof MilestoneServiceError) {
        throw error;
      }
      throw new MilestoneServiceError(`Failed to create milestone: ${(error as Error).message}`);
    }
  }

  public async getMilestoneById(id: string): Promise<MilestoneDetailOutput> {
    try {
      const milestone = await this.milestoneRepository.findById(id);
      if (!milestone) {
        throw new MilestoneNotFoundError(id);
      }
      return milestone;
    } catch (error) {
      if (error instanceof MilestoneServiceError) {
        throw error;
      }
      throw new MilestoneServiceError(
        `Failed to retrieve milestone by ID ${id}: ${(error as Error).message}`
      );
    }
  }

  public async listMilestones(
    options: FindMilestonesServiceOptions
  ): Promise<PaginatedMilestonesOutput> {
    try {
      return await this.milestoneRepository.findMany({
        pagination: options.pagination,
        search: options.search,
        status: options.status,
        projectId: options.projectId,
        includeDeleted: options.includeDeleted,
        sortField: options.sortField,
        sortOrder: options.sortOrder,
      });
    } catch (error) {
      throw new MilestoneServiceError(`Failed to list milestones: ${(error as Error).message}`);
    }
  }

  public async updateMilestone(
    id: string,
    data: UpdateMilestoneServiceInput,
    currentUserId: string
  ): Promise<MilestoneDetailOutput> {
    try {
      const milestone = await this.milestoneRepository.findById(id);
      if (!milestone) {
        throw new MilestoneNotFoundError(id);
      }

      if (milestone.deletedAt !== null) {
        throw new MilestoneArchivedError(id);
      }

      // Check duplicates if title changes
      if (data.title && data.title.toLowerCase() !== milestone.title.toLowerCase()) {
        const existing = await this.milestoneRepository.findByTitleInProject(
          data.title,
          milestone.projectId
        );
        if (existing) {
          throw new MilestoneAlreadyExistsError(data.title, milestone.projectId);
        }
      }

      // Handle completedAt status logic
      const updatedStatus = data.status ?? milestone.status;
      let completedAt = data.completedAt !== undefined ? data.completedAt : milestone.completedAt;

      if (
        updatedStatus === MilestoneStatus.COMPLETED &&
        milestone.status !== MilestoneStatus.COMPLETED
      ) {
        if (!completedAt) {
          completedAt = new Date();
        }
      } else if (
        updatedStatus !== MilestoneStatus.COMPLETED &&
        milestone.status === MilestoneStatus.COMPLETED
      ) {
        completedAt = null;
      }

      const result = await this.milestoneRepository.update(id, {
        ...data,
        completedAt,
        updatedById: currentUserId,
      });

      if (!result) {
        throw new MilestoneNotFoundError(id);
      }

      // Log side-effect auditing with old and new values for status and completedAt
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.MILESTONES,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Milestone',
          entityId: result.id,
          resourceName: result.title,
          oldValues: {
            status: milestone.status,
            completedAt: milestone.completedAt ? milestone.completedAt.toISOString() : null,
          } as unknown as Prisma.InputJsonValue,
          newValues: {
            status: result.status,
            completedAt: result.completedAt ? result.completedAt.toISOString() : null,
          } as unknown as Prisma.InputJsonValue,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for milestone update:', auditError);
      }

      return result;
    } catch (error) {
      if (error instanceof MilestoneServiceError) {
        throw error;
      }
      throw new MilestoneServiceError(
        `Failed to update milestone ${id}: ${(error as Error).message}`
      );
    }
  }

  public async archiveMilestone(id: string, currentUserId: string): Promise<MilestoneDetailOutput> {
    try {
      const milestone = await this.milestoneRepository.findById(id);
      if (!milestone) {
        throw new MilestoneNotFoundError(id);
      }

      if (milestone.deletedAt !== null) {
        throw new InvalidStatusTransitionError(`Milestone ${id} is already archived.`);
      }

      const deleted = await this.milestoneRepository.softDelete(id);
      if (!deleted) {
        throw new MilestoneNotFoundError(id);
      }

      const updatedMilestone = await this.milestoneRepository.findById(id, {
        includeDeleted: true,
      });
      if (!updatedMilestone) {
        throw new MilestoneNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.DELETE,
          module: AuditModule.MILESTONES,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Milestone',
          entityId: id,
          resourceName: milestone.title,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for milestone archiving:', auditError);
      }

      return updatedMilestone;
    } catch (error) {
      if (error instanceof MilestoneServiceError) {
        throw error;
      }
      throw new MilestoneServiceError(
        `Failed to archive milestone ${id}: ${(error as Error).message}`
      );
    }
  }

  public async restoreMilestone(id: string, currentUserId: string): Promise<MilestoneDetailOutput> {
    try {
      const milestone = await this.milestoneRepository.findById(id, { includeDeleted: true });
      if (!milestone) {
        throw new MilestoneNotFoundError(id);
      }

      if (milestone.deletedAt === null) {
        throw new InvalidStatusTransitionError(`Milestone ${id} is already active.`);
      }

      const restored = await this.milestoneRepository.restore(id);

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.MILESTONES,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Milestone',
          entityId: id,
          resourceName: restored.title,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for milestone restoration:', auditError);
      }

      return restored;
    } catch (error) {
      if (error instanceof MilestoneServiceError) {
        throw error;
      }
      throw new MilestoneServiceError(
        `Failed to restore milestone ${id}: ${(error as Error).message}`
      );
    }
  }

  public async countMilestones(filters: MilestoneFiltersInput): Promise<number> {
    try {
      return await this.milestoneRepository.count(filters);
    } catch (error) {
      throw new MilestoneServiceError(`Failed to count milestones: ${(error as Error).message}`);
    }
  }
}
