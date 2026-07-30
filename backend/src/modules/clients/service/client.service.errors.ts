import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base operational error for the Clients business module.
 */
export class ClientServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ClientServiceError';
  }
}

/**
 * Thrown when a client query by ID or code returns no active record.
 */
export class ClientNotFoundError extends ClientServiceError {
  constructor(identifier: string) {
    super(`Client with identifier '${identifier}' was not found.`);
    this.name = 'ClientNotFoundError';
  }
}

/**
 * Thrown when trying to create/update a client with a code that is already registered.
 */
export class ClientAlreadyExistsError extends ClientServiceError {
  constructor(code: string) {
    super(`Client with abbreviation code '${code}' already exists.`);
    this.name = 'ClientAlreadyExistsError';
  }
}

/**
 * Thrown when attempting write operations on a soft-deleted (archived) client.
 */
export class ClientArchivedError extends ClientServiceError {
  constructor(id: string) {
    super(`Client with ID '${id}' is archived and cannot be updated.`);
    this.name = 'ClientArchivedError';
  }
}

/**
 * Thrown when transitioning status illegally (e.g. restoring an active client).
 */
export class InvalidStatusTransitionError extends ClientServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}

/**
 * Thrown when the designated account manager ID does not resolve to an active system user.
 */
export class AccountManagerNotFoundError extends ClientServiceError {
  constructor(managerId: string) {
    super(`Designated account manager with ID '${managerId}' was not found or is inactive.`);
    this.name = 'AccountManagerNotFoundError';
  }
}
