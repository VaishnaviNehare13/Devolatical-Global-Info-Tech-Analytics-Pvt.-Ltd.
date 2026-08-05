import { ProjectStatus, AuditAction, AuditModule, AuditStatus, AuditSeverity } from '@prisma/client';
import { IProjectRepository } from '../repository/project.repository.interface';
import { IClientRepository } from '../../clients/repository/client.repository.interface';
import { IUserRepository } from '../../users/repositories/user.repository.interface';
import { IAuditLogService } from '../../audit-logs/service/audit-log.service';
import {
  ProjectDetailOutput,
  PaginatedProjectsOutput,
  ProjectFiltersInput,
} from '../repository/project.repository.types';
import { IProjectService } from './project.service.interface';
import {
  CreateProjectServiceInput,
  UpdateProjectServiceInput,
  FindProjectsServiceOptions,
} from './project.service.types';
import {
  ProjectServiceError,
  ProjectNotFoundError,
  ProjectAlreadyExistsError,
  ProjectArchivedError,
  InvalidStatusTransitionError,
  ProjectManagerNotFoundError,
  ClientNotFoundError,
  InvalidDateRangeError,
} from './project.service.errors';

/**
 * Concrete implementation of Projects Business Service.
 * Implements IProjectService contract.
 */
export class ProjectService implements IProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly clientRepository: IClientRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogService: IAuditLogService
  ) {}

  /**
   * Creates a new project record, validates parent client and manager existence, and writes an audit log.
   */
  public async createProject(
    data: CreateProjectServiceInput,
    currentUserId: string
  ): Promise<ProjectDetailOutput> {
    try {
      const codeExists = await this.projectRepository.existsByCode(data.code);
      if (codeExists) {
        throw new ProjectAlreadyExistsError(data.code);
      }

      // Validate parent client exists and is not soft deleted or archived
      const client = await this.clientRepository.findById(data.clientId);
      if (!client || client.deletedAt !== null || client.status === 'ARCHIVED') {
        throw new ClientNotFoundError(data.clientId);
      }

      // Validate manager exists and is active
      if (data.projectManagerId) {
        const manager = await this.userRepository.findUserById(data.projectManagerId);
        if (!manager || manager.status !== 'ACTIVE') {
          throw new ProjectManagerNotFoundError(data.projectManagerId);
        }
      }

      // Validate date ranges
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (start > end) {
          throw new InvalidDateRangeError(start, end);
        }
      }

      const project = await this.projectRepository.create({
        ...data,
        createdById: currentUserId,
      });

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.CREATE,
          module: AuditModule.PROJECTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Project',
          entityId: project.id,
          resourceName: project.name,
          newValues: {
            id: project.id,
            code: project.code,
            name: project.name,
            clientId: project.clientId,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for project creation:', auditError);
      }

      return project;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(`Failed to create project: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves a project by unique ID. Excludes soft-deleted records by default.
   */
  public async getProjectById(id: string): Promise<ProjectDetailOutput> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new ProjectNotFoundError(id);
      }
      return project;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(
        `Failed to retrieve project by ID ${id}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Retrieves a project by unique code. Excludes soft-deleted records by default.
   */
  public async getProjectByCode(code: string): Promise<ProjectDetailOutput> {
    try {
      const project = await this.projectRepository.findByCode(code);
      if (!project) {
        throw new ProjectNotFoundError(code);
      }
      return project;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(
        `Failed to retrieve project by code ${code}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Searches, filters, and paginates project summaries.
   */
  public async listProjects(options: FindProjectsServiceOptions): Promise<PaginatedProjectsOutput> {
    try {
      return await this.projectRepository.findMany(options);
    } catch (error) {
      throw new ProjectServiceError(`Failed to list projects: ${(error as Error).message}`);
    }
  }

  /**
   * Counts the projects matching filter criteria.
   */
  public async countProjects(filters: ProjectFiltersInput): Promise<number> {
    try {
      return await this.projectRepository.count(filters);
    } catch (error) {
      throw new ProjectServiceError(`Failed to count projects: ${(error as Error).message}`);
    }
  }

  /**
   * Updates an existing active project profile and writes an audit log.
   */
  public async updateProject(
    id: string,
    data: UpdateProjectServiceInput,
    currentUserId: string
  ): Promise<ProjectDetailOutput> {
    try {
      const existingProject = await this.projectRepository.findById(id);
      if (!existingProject) {
        throw new ProjectNotFoundError(id);
      }

      if (existingProject.status === ProjectStatus.ARCHIVED || existingProject.deletedAt !== null) {
        throw new ProjectArchivedError(id);
      }

      // Validate unique code constraint if changing
      if (data.code && data.code !== existingProject.code) {
        const codeProject = await this.projectRepository.findByCode(data.code);
        if (codeProject && codeProject.id !== id) {
          throw new ProjectAlreadyExistsError(data.code);
        }
      }

      // Validate client exists and is not soft deleted or archived
      if (data.clientId && data.clientId !== existingProject.clientId) {
        const client = await this.clientRepository.findById(data.clientId);
        if (!client || client.deletedAt !== null || client.status === 'ARCHIVED') {
          throw new ClientNotFoundError(data.clientId);
        }
      }

      // Validate manager exists and is active
      if (data.projectManagerId && data.projectManagerId !== existingProject.projectManagerId) {
        const manager = await this.userRepository.findUserById(data.projectManagerId);
        if (!manager || manager.status !== 'ACTIVE') {
          throw new ProjectManagerNotFoundError(data.projectManagerId);
        }
      }

      // Validate combined date range
      const startVal = data.startDate !== undefined ? data.startDate : existingProject.startDate;
      const endVal = data.endDate !== undefined ? data.endDate : existingProject.endDate;
      if (startVal && endVal) {
        const start = new Date(startVal);
        const end = new Date(endVal);
        if (start > end) {
          throw new InvalidDateRangeError(start, end);
        }
      }

      // Prevent direct modification of status to ARCHIVED to force archiveProject flow
      if (data.status === ProjectStatus.ARCHIVED) {
        throw new InvalidStatusTransitionError(
          'Direct status update to ARCHIVED is restricted. Use the archiveProject method instead.'
        );
      }

      const updated = await this.projectRepository.update(id, {
        ...data,
        updatedById: currentUserId,
      });

      if (!updated) {
        throw new ProjectNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.PROJECTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Project',
          entityId: updated.id,
          resourceName: updated.name,
          oldValues: {
            code: existingProject.code,
            name: existingProject.name,
            status: existingProject.status,
          },
          newValues: {
            code: updated.code,
            name: updated.name,
            status: updated.status,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for project update:', auditError);
      }

      return updated;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(`Failed to update project ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Soft deletes / archives a project, ensuring they are not already archived.
   */
  public async archiveProject(id: string, currentUserId: string): Promise<ProjectDetailOutput> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new ProjectNotFoundError(id);
      }

      if (project.status === ProjectStatus.ARCHIVED || project.deletedAt !== null) {
        throw new InvalidStatusTransitionError(`Project ${id} is already archived.`);
      }

      const deleted = await this.projectRepository.softDelete(id);
      if (!deleted) {
        throw new ProjectNotFoundError(id);
      }

      const updatedProject = await this.projectRepository.findById(id, { includeDeleted: true });
      if (!updatedProject) {
        throw new ProjectNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.DELETE,
          module: AuditModule.PROJECTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Project',
          entityId: id,
          resourceName: project.name,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for project archiving:', auditError);
      }

      return updatedProject;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(`Failed to archive project ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Restores a soft-deleted project back to PLANNING status.
   */
  public async restoreProject(id: string, currentUserId: string): Promise<ProjectDetailOutput> {
    try {
      const project = await this.projectRepository.findById(id, { includeDeleted: true });
      if (!project) {
        throw new ProjectNotFoundError(id);
      }

      if (project.status !== ProjectStatus.ARCHIVED && project.deletedAt === null) {
        throw new InvalidStatusTransitionError(`Project ${id} is already active.`);
      }

      const restored = await this.projectRepository.update(id, {
        deletedAt: null,
        status: ProjectStatus.PLANNING,
        updatedById: currentUserId,
      });

      if (!restored) {
        throw new ProjectNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.PROJECTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Project',
          entityId: id,
          resourceName: restored.name,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for project restoration:', auditError);
      }

      return restored;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(`Failed to restore project ${id}: ${(error as Error).message}`);
    }
  }
}
