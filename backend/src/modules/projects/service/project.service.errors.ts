import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base operational error for the Projects business module.
 */
export class ProjectServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectServiceError';
  }
}

/**
 * Thrown when a project query by ID or code returns no active record.
 */
export class ProjectNotFoundError extends ProjectServiceError {
  constructor(identifier: string) {
    super(`Project with identifier '${identifier}' was not found.`);
    this.name = 'ProjectNotFoundError';
  }
}

/**
 * Thrown when trying to create/update a project with a code that is already registered.
 */
export class ProjectAlreadyExistsError extends ProjectServiceError {
  constructor(code: string) {
    super(`Project with abbreviation code '${code}' already exists.`);
    this.name = 'ProjectAlreadyExistsError';
  }
}

/**
 * Thrown when attempting write operations on a soft-deleted (archived) project.
 */
export class ProjectArchivedError extends ProjectServiceError {
  constructor(id: string) {
    super(`Project with ID '${id}' is archived and cannot be updated.`);
    this.name = 'ProjectArchivedError';
  }
}

/**
 * Thrown when transitioning status illegally (e.g. restoring an active project).
 */
export class InvalidStatusTransitionError extends ProjectServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}

/**
 * Thrown when the designated project manager ID does not resolve to an active system user.
 */
export class ProjectManagerNotFoundError extends ProjectServiceError {
  constructor(managerId: string) {
    super(`Designated project manager with ID '${managerId}' was not found or is inactive.`);
    this.name = 'ProjectManagerNotFoundError';
  }
}

/**
 * Thrown when the parent client ID does not resolve to an active client.
 */
export class ClientNotFoundError extends ProjectServiceError {
  constructor(clientId: string) {
    super(`Parent client with ID '${clientId}' was not found or is inactive.`);
    this.name = 'ClientNotFoundError';
  }
}

/**
 * Thrown when the start date occurs after the end date.
 */
export class InvalidDateRangeError extends ProjectServiceError {
  constructor(startDate: Date, endDate: Date) {
    super(
      `Start date '${startDate.toISOString()}' must occur before end date '${endDate.toISOString()}'.`
    );
    this.name = 'InvalidDateRangeError';
  }
}
