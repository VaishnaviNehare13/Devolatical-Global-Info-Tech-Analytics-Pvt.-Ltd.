import { ServiceError } from '../../../shared/types/service.error';

export class MilestoneServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'MilestoneServiceError';
  }
}

export class MilestoneNotFoundError extends MilestoneServiceError {
  constructor(identifier: string) {
    super(`Milestone with identifier '${identifier}' was not found.`);
    this.name = 'MilestoneNotFoundError';
  }
}

export class MilestoneAlreadyExistsError extends MilestoneServiceError {
  constructor(title: string, projectId: string) {
    super(`Milestone with title '${title}' already exists in project '${projectId}'.`);
    this.name = 'MilestoneAlreadyExistsError';
  }
}

export class MilestoneArchivedError extends MilestoneServiceError {
  constructor(id: string) {
    super(`Milestone with ID '${id}' is archived and cannot be updated.`);
    this.name = 'MilestoneArchivedError';
  }
}

export class InvalidStatusTransitionError extends MilestoneServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}

export class ProjectNotFoundError extends MilestoneServiceError {
  constructor(projectId: string) {
    super(`Parent project with ID '${projectId}' was not found.`);
    this.name = 'ProjectNotFoundError';
  }
}

export class ProjectArchivedError extends MilestoneServiceError {
  constructor(projectId: string) {
    super(`Parent project with ID '${projectId}' is archived and cannot receive new milestones.`);
    this.name = 'ProjectArchivedError';
  }
}
