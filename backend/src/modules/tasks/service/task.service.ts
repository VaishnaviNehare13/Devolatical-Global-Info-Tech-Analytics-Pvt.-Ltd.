import { AuditAction, AuditModule, AuditStatus, AuditSeverity } from '@prisma/client';
import { ITaskRepository } from '../repository/task.repository.interface';
import { IUserRepository } from '../../users/repositories/user.repository.interface';
import { IProjectRepository } from '../../projects/repository/project.repository.interface';
import { IMilestoneRepository } from '../../milestones/repository/milestone.repository.interface';
import { IAuditLogService } from '../../audit-logs/service/audit-log.service';
import {
  TaskDetailOutput,
  PaginatedTasksOutput,
  TaskFiltersInput,
} from '../repository/task.repository.types';
import { ITaskService } from './task.service.interface';
import {
  CreateTaskServiceInput,
  UpdateTaskServiceInput,
  FindTasksServiceOptions,
} from './task.service.types';
import {
  TaskServiceError,
  TaskNotFoundError,
  TaskArchivedError,
  InvalidStatusTransitionError,
  TaskAssigneeNotFoundError,
  ProjectNotFoundError,
  ProjectArchivedError,
  MilestoneNotFoundError,
  MilestoneArchivedError,
  ParentTaskNotFoundError,
  ParentTaskArchivedError,
  InvalidParentTaskError,
  InvalidTaskProjectRelationError,
} from './task.service.errors';

/**
 * Concrete implementation of Tasks Business Service.
 * Coordinates database operations via ITaskRepository, logs side-effect audits,
 * and validates linked User, Project, Milestone, and Parent Task entities.
 */
export class TaskService implements ITaskService {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly milestoneRepository: IMilestoneRepository,
    private readonly auditLogService: IAuditLogService
  ) {}

  /**
   * Persists a new Task record after validating referenced entities.
   */
  public async createTask(
    data: CreateTaskServiceInput,
    currentUserId: string
  ): Promise<TaskDetailOutput> {
    try {
      // 1. Validate referenced project exists and is active
      const project = await this.projectRepository.findById(data.projectId);
      if (!project) {
        throw new ProjectNotFoundError(data.projectId);
      }
      if (project.deletedAt !== null || project.status === 'ARCHIVED') {
        throw new ProjectArchivedError(data.projectId);
      }

      // 2. Validate referenced milestone if provided
      if (data.milestoneId) {
        const milestone = await this.milestoneRepository.findById(data.milestoneId);
        if (!milestone) {
          throw new MilestoneNotFoundError(data.milestoneId);
        }
        if (milestone.deletedAt !== null) {
          throw new MilestoneArchivedError(data.milestoneId);
        }
        if (milestone.projectId !== data.projectId) {
          throw new InvalidTaskProjectRelationError(
            `Milestone '${data.milestoneId}' does not belong to project '${data.projectId}'.`
          );
        }
      }

      // 3. Validate assignee user exists and is active
      if (data.assignedToId) {
        const assignee = await this.userRepository.findUserById(data.assignedToId);
        if (!assignee || assignee.status !== 'ACTIVE') {
          throw new TaskAssigneeNotFoundError(data.assignedToId);
        }
      }

      // 4. Validate parent task if provided
      if (data.parentId) {
        const parentTask = await this.taskRepository.findById(data.parentId, {
          includeDeleted: true,
        });
        if (!parentTask) {
          throw new ParentTaskNotFoundError(data.parentId);
        }
        if (parentTask.deletedAt !== null) {
          throw new ParentTaskArchivedError(data.parentId);
        }
        if (parentTask.projectId !== data.projectId) {
          throw new InvalidTaskProjectRelationError(
            `Parent task '${data.parentId}' belongs to a different project.`
          );
        }
      }

      const created = await this.taskRepository.create({
        ...data,
        createdById: currentUserId,
      });

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.CREATE,
          module: AuditModule.TASKS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Task',
          entityId: created.id,
          resourceName: created.title,
          newValues: {
            id: created.id,
            code: created.code,
            title: created.title,
            status: created.status,
            priority: created.priority,
            projectId: created.projectId,
            milestoneId: created.milestoneId,
            assignedToId: created.assignedToId,
            parentId: created.parentId,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for task creation:', auditError);
      }

      return created;
    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      throw new TaskServiceError(`Failed to create task: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves a Task by unique ID. Excludes soft-deleted records by default.
   */
  public async getTaskById(id: string): Promise<TaskDetailOutput> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new TaskNotFoundError(id);
      }
      return task;
    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      throw new TaskServiceError(`Failed to fetch task ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Lists, filters, and paginates Tasks.
   */
  public async listTasks(options: FindTasksServiceOptions): Promise<PaginatedTasksOutput> {
    try {
      return await this.taskRepository.findMany(options);
    } catch (error) {
      throw new TaskServiceError(`Failed to list tasks: ${(error as Error).message}`);
    }
  }

  /**
   * Updates an existing active Task record after validating reference updates.
   */
  public async updateTask(
    id: string,
    data: UpdateTaskServiceInput,
    currentUserId: string
  ): Promise<TaskDetailOutput> {
    try {
      const existingTask = await this.taskRepository.findById(id);
      if (!existingTask) {
        throw new TaskNotFoundError(id);
      }

      if (existingTask.deletedAt !== null) {
        throw new TaskArchivedError(id);
      }

      const targetProjectId = data.projectId ?? existingTask.projectId;

      // 1. Validate project if changed
      if (data.projectId && data.projectId !== existingTask.projectId) {
        const project = await this.projectRepository.findById(data.projectId);
        if (!project) {
          throw new ProjectNotFoundError(data.projectId);
        }
        if (project.deletedAt !== null || project.status === 'ARCHIVED') {
          throw new ProjectArchivedError(data.projectId);
        }
      }

      // 2. Validate milestone if changed/provided
      if (data.milestoneId !== undefined) {
        if (data.milestoneId !== null && data.milestoneId !== existingTask.milestoneId) {
          const milestone = await this.milestoneRepository.findById(data.milestoneId);
          if (!milestone) {
            throw new MilestoneNotFoundError(data.milestoneId);
          }
          if (milestone.deletedAt !== null) {
            throw new MilestoneArchivedError(data.milestoneId);
          }
          if (milestone.projectId !== targetProjectId) {
            throw new InvalidTaskProjectRelationError(
              `Milestone '${data.milestoneId}' does not belong to project '${targetProjectId}'.`
            );
          }
        } else if (
          data.milestoneId !== null &&
          data.projectId &&
          data.projectId !== existingTask.projectId
        ) {
          const milestone = await this.milestoneRepository.findById(data.milestoneId);
          if (milestone && milestone.projectId !== targetProjectId) {
            throw new InvalidTaskProjectRelationError(
              `Milestone '${data.milestoneId}' does not belong to project '${targetProjectId}'.`
            );
          }
        }
      } else if (
        data.projectId &&
        data.projectId !== existingTask.projectId &&
        existingTask.milestoneId
      ) {
        const milestone = await this.milestoneRepository.findById(existingTask.milestoneId);
        if (milestone && milestone.projectId !== targetProjectId) {
          throw new InvalidTaskProjectRelationError(
            `Existing milestone '${existingTask.milestoneId}' does not belong to the updated project '${targetProjectId}'.`
          );
        }
      }

      // 3. Validate assignee user if changed
      if (data.assignedToId && data.assignedToId !== existingTask.assignedToId) {
        const assignee = await this.userRepository.findUserById(data.assignedToId);
        if (!assignee || assignee.status !== 'ACTIVE') {
          throw new TaskAssigneeNotFoundError(data.assignedToId);
        }
      }

      // 4. Validate parent task if changed/provided
      if (data.parentId !== undefined) {
        if (data.parentId === id) {
          throw new InvalidParentTaskError('A task cannot be its own parent.');
        }
        if (data.parentId !== null) {
          const parentTask = await this.taskRepository.findById(data.parentId, {
            includeDeleted: true,
          });
          if (!parentTask) {
            throw new ParentTaskNotFoundError(data.parentId);
          }
          if (parentTask.deletedAt !== null) {
            throw new ParentTaskArchivedError(data.parentId);
          }
          if (parentTask.projectId !== targetProjectId) {
            throw new InvalidTaskProjectRelationError(
              `Parent task '${data.parentId}' belongs to a different project.`
            );
          }
        }
      } else if (
        data.projectId &&
        data.projectId !== existingTask.projectId &&
        existingTask.parentId
      ) {
        const parentTask = await this.taskRepository.findById(existingTask.parentId, {
          includeDeleted: true,
        });
        if (parentTask && parentTask.projectId !== targetProjectId) {
          throw new InvalidTaskProjectRelationError(
            `Existing parent task '${existingTask.parentId}' belongs to a different project.`
          );
        }
      }

      const updated = await this.taskRepository.update(id, {
        ...data,
        updatedById: currentUserId,
      });

      if (!updated) {
        throw new TaskNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.TASKS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Task',
          entityId: updated.id,
          resourceName: updated.title,
          oldValues: {
            title: existingTask.title,
            status: existingTask.status,
            priority: existingTask.priority,
            projectId: existingTask.projectId,
            milestoneId: existingTask.milestoneId,
            assignedToId: existingTask.assignedToId,
            parentId: existingTask.parentId,
          },
          newValues: {
            title: updated.title,
            status: updated.status,
            priority: updated.priority,
            projectId: updated.projectId,
            milestoneId: updated.milestoneId,
            assignedToId: updated.assignedToId,
            parentId: updated.parentId,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for task update:', auditError);
      }

      return updated;
    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      throw new TaskServiceError(`Failed to update task ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Soft deletes / archives a Task, ensuring it is not already archived.
   */
  public async archiveTask(id: string, currentUserId: string): Promise<TaskDetailOutput> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new TaskNotFoundError(id);
      }

      if (task.deletedAt !== null) {
        throw new InvalidStatusTransitionError(`Task ${id} is already archived.`);
      }

      const deleted = await this.taskRepository.softDelete(id);
      if (!deleted) {
        throw new TaskNotFoundError(id);
      }

      const updatedTask = await this.taskRepository.findById(id, { includeDeleted: true });
      if (!updatedTask) {
        throw new TaskNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.DELETE,
          module: AuditModule.TASKS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Task',
          entityId: id,
          resourceName: task.title,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for task archiving:', auditError);
      }

      return updatedTask;
    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      throw new TaskServiceError(`Failed to archive task ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Restores a soft-deleted Task back to active status.
   */
  public async restoreTask(id: string, currentUserId: string): Promise<TaskDetailOutput> {
    try {
      const task = await this.taskRepository.findById(id, { includeDeleted: true });
      if (!task) {
        throw new TaskNotFoundError(id);
      }

      if (task.deletedAt === null) {
        throw new InvalidStatusTransitionError(`Task ${id} is already active.`);
      }

      const restored = await this.taskRepository.restore(id);

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.TASKS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Task',
          entityId: id,
          resourceName: restored.title,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for task restoration:', auditError);
      }

      return restored;
    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      throw new TaskServiceError(`Failed to restore task ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Counts Tasks matching query filter.
   */
  public async countTasks(filters: TaskFiltersInput): Promise<number> {
    try {
      return await this.taskRepository.count(filters);
    } catch (error) {
      throw new TaskServiceError(`Failed to count tasks: ${(error as Error).message}`);
    }
  }
}
