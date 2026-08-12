import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base operational error for the Documents business module.
 */
export class DocumentServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentServiceError';
  }
}

/**
 * Thrown when a document query by ID returns no active record.
 */
export class DocumentNotFoundError extends DocumentServiceError {
  constructor(identifier: string) {
    super(`Document with identifier '${identifier}' was not found.`);
    this.name = 'DocumentNotFoundError';
  }
}

/**
 * Thrown when attempting write operations on a soft-deleted (archived) document.
 */
export class DocumentArchivedError extends DocumentServiceError {
  constructor(id: string) {
    super(`Document with ID '${id}' is archived and cannot be updated.`);
    this.name = 'DocumentArchivedError';
  }
}

/**
 * Thrown when performing invalid status transitions (e.g. archiving an already archived document or restoring an active one).
 */
export class InvalidDocumentStatusTransitionError extends DocumentServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDocumentStatusTransitionError';
  }
}

/**
 * Thrown when a referenced client does not exist.
 */
export class ClientNotFoundError extends DocumentServiceError {
  constructor(clientId: string) {
    super(`Referenced client with ID '${clientId}' was not found.`);
    this.name = 'ClientNotFoundError';
  }
}

/**
 * Thrown when a referenced client is archived.
 */
export class ClientArchivedError extends DocumentServiceError {
  constructor(clientId: string) {
    super(`Referenced client with ID '${clientId}' is archived.`);
    this.name = 'ClientArchivedError';
  }
}

/**
 * Thrown when a referenced project does not exist.
 */
export class ProjectNotFoundError extends DocumentServiceError {
  constructor(projectId: string) {
    super(`Referenced project with ID '${projectId}' was not found.`);
    this.name = 'ProjectNotFoundError';
  }
}

/**
 * Thrown when a referenced project is archived.
 */
export class ProjectArchivedError extends DocumentServiceError {
  constructor(projectId: string) {
    super(`Referenced project with ID '${projectId}' is archived.`);
    this.name = 'ProjectArchivedError';
  }
}

/**
 * Thrown when a referenced milestone does not exist.
 */
export class MilestoneNotFoundError extends DocumentServiceError {
  constructor(milestoneId: string) {
    super(`Referenced milestone with ID '${milestoneId}' was not found.`);
    this.name = 'MilestoneNotFoundError';
  }
}

/**
 * Thrown when a referenced milestone is archived.
 */
export class MilestoneArchivedError extends DocumentServiceError {
  constructor(milestoneId: string) {
    super(`Referenced milestone with ID '${milestoneId}' is archived.`);
    this.name = 'MilestoneArchivedError';
  }
}

/**
 * Thrown when cross-entity relationships do not match (e.g. milestone belongs to a different project).
 */
export class InvalidDocumentEntityRelationError extends DocumentServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDocumentEntityRelationError';
  }
}
