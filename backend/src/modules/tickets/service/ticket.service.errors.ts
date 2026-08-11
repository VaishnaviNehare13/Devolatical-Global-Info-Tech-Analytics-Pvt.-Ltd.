import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base operational error for the Tickets business module.
 */
export class TicketServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'TicketServiceError';
  }
}

/**
 * Thrown when a ticket query by ID returns no active record.
 */
export class TicketNotFoundError extends TicketServiceError {
  constructor(identifier: string) {
    super(`Ticket with identifier '${identifier}' was not found.`);
    this.name = 'TicketNotFoundError';
  }
}

/**
 * Thrown when attempting write operations on a soft-deleted (archived) ticket.
 */
export class TicketArchivedError extends TicketServiceError {
  constructor(id: string) {
    super(`Ticket with ID '${id}' is archived and cannot be updated.`);
    this.name = 'TicketArchivedError';
  }
}

/**
 * Thrown when performing invalid status changes (e.g. archive/restore on already archived/active records).
 */
export class InvalidStatusTransitionError extends TicketServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}

/**
 * Thrown when the designated assignee ID does not resolve to an active system user.
 */
export class TicketAssigneeNotFoundError extends TicketServiceError {
  constructor(assigneeId: string) {
    super(`Designated assignee with ID '${assigneeId}' was not found or is inactive.`);
    this.name = 'TicketAssigneeNotFoundError';
  }
}

/**
 * Thrown when a referenced client does not exist.
 */
export class ClientNotFoundError extends TicketServiceError {
  constructor(clientId: string) {
    super(`Referenced client with ID '${clientId}' was not found.`);
    this.name = 'ClientNotFoundError';
  }
}

/**
 * Thrown when a referenced client is archived.
 */
export class ClientArchivedError extends TicketServiceError {
  constructor(clientId: string) {
    super(`Referenced client with ID '${clientId}' is archived.`);
    this.name = 'ClientArchivedError';
  }
}

/**
 * Thrown when a referenced project does not exist.
 */
export class ProjectNotFoundError extends TicketServiceError {
  constructor(projectId: string) {
    super(`Referenced project with ID '${projectId}' was not found.`);
    this.name = 'ProjectNotFoundError';
  }
}

/**
 * Thrown when a referenced project is archived.
 */
export class ProjectArchivedError extends TicketServiceError {
  constructor(projectId: string) {
    super(`Referenced project with ID '${projectId}' is archived.`);
    this.name = 'ProjectArchivedError';
  }
}
