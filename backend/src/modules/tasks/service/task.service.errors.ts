import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base operational error for the Tasks business module.
 */
export class TaskServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'TaskServiceError';
  }
}

/**
 * Thrown when a task query by ID returns no active record.
 */
export class TaskNotFoundError extends TaskServiceError {
  constructor(identifier: string) {
    super(`Task with identifier '${identifier}' was not found.`);
    this.name = 'TaskNotFoundError';
  }
}

/**
 * Thrown when attempting write operations on a soft-deleted (archived) task.
 */
export class TaskArchivedError extends TaskServiceError {
  constructor(id: string) {
    super(`Task with ID '${id}' is archived and cannot be updated.`);
    this.name = 'TaskArchivedError';
  }
}

/**
 * Thrown when performing invalid status changes (e.g. archive/restore on already archived/active records).
 */
export class InvalidStatusTransitionError extends TaskServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}

/**
 * Thrown when the designated assignee ID does not resolve to an active system user.
 */
export class TaskAssigneeNotFoundError extends TaskServiceError {
  constructor(assigneeId: string) {
    super(`Designated assignee with ID '${assigneeId}' was not found or is inactive.`);
    this.name = 'TaskAssigneeNotFoundError';
  }
}

/**
 * Thrown when a referenced project does not exist.
 */
export class ProjectNotFoundError extends TaskServiceError {
  constructor(projectId: string) {
    super(`Referenced project with ID '${projectId}' was not found.`);
    this.name = 'ProjectNotFoundError';
  }
}

/**
 * Thrown when a referenced project is archived.
 */
export class ProjectArchivedError extends TaskServiceError {
  constructor(projectId: string) {
    super(`Referenced project with ID '${projectId}' is archived.`);
    this.name = 'ProjectArchivedError';
  }
}

/**
 * Thrown when a referenced milestone does not exist.
 */
export class MilestoneNotFoundError extends TaskServiceError {
  constructor(milestoneId: string) {
    super(`Referenced milestone with ID '${milestoneId}' was not found.`);
    this.name = 'MilestoneNotFoundError';
  }
}

/**
 * Thrown when a referenced milestone is archived.
 */
export class MilestoneArchivedError extends TaskServiceError {
  constructor(milestoneId: string) {
    super(`Referenced milestone with ID '${milestoneId}' is archived.`);
    this.name = 'MilestoneArchivedError';
  }
}

/**
 * Thrown when a referenced parent task does not exist.
 */
export class ParentTaskNotFoundError extends TaskServiceError {
  constructor(parentId: string) {
    super(`Referenced parent task with ID '${parentId}' was not found.`);
    this.name = 'ParentTaskNotFoundError';
  }
}

/**
 * Thrown when a referenced parent task is archived.
 */
export class ParentTaskArchivedError extends TaskServiceError {
  constructor(parentId: string) {
    super(`Referenced parent task with ID '${parentId}' is archived.`);
    this.name = 'ParentTaskArchivedError';
  }
}

/**
 * Thrown when parent task assignment is invalid (e.g., self-parenting).
 */
export class InvalidParentTaskError extends TaskServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidParentTaskError';
  }
}

/**
 * Thrown when cross-entity relationships do not match the task's project.
 */
export class InvalidTaskProjectRelationError extends TaskServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTaskProjectRelationError';
  }
}
