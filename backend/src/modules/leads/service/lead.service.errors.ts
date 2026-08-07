import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base operational error for the Leads business module.
 */
export class LeadServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'LeadServiceError';
  }
}

/**
 * Thrown when a lead query by ID returns no active record.
 */
export class LeadNotFoundError extends LeadServiceError {
  constructor(identifier: string) {
    super(`Lead with identifier '${identifier}' was not found.`);
    this.name = 'LeadNotFoundError';
  }
}

/**
 * Thrown when attempting write operations on a soft-deleted (archived) lead.
 */
export class LeadArchivedError extends LeadServiceError {
  constructor(id: string) {
    super(`Lead with ID '${id}' is archived and cannot be updated.`);
    this.name = 'LeadArchivedError';
  }
}

/**
 * Thrown when transitioning status illegally.
 */
export class InvalidStatusTransitionError extends LeadServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}

/**
 * Thrown when the designated assignee ID does not resolve to an active system user.
 */
export class LeadAssigneeNotFoundError extends LeadServiceError {
  constructor(assigneeId: string) {
    super(`Designated assignee with ID '${assigneeId}' was not found or is inactive.`);
    this.name = 'LeadAssigneeNotFoundError';
  }
}
