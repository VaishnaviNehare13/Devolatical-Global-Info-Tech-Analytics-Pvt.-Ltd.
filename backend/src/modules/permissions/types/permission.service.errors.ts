import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base service exception class for all Permissions Module workflows.
 */
export class PermissionServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionServiceError';
  }
}

export class PermissionNotFoundError extends PermissionServiceError {
  constructor(message: string = 'Permission not found.') {
    super(message);
    this.name = 'PermissionNotFoundError';
  }
}

export class DuplicatePermissionNameError extends PermissionServiceError {
  constructor(message: string = 'Permission name is already in use.') {
    super(message);
    this.name = 'DuplicatePermissionNameError';
  }
}

export class DuplicatePermissionCodeError extends PermissionServiceError {
  constructor(message: string = 'Permission code is already in use.') {
    super(message);
    this.name = 'DuplicatePermissionCodeError';
  }
}

export class ProtectedPermissionError extends PermissionServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ProtectedPermissionError';
  }
}

export class InvalidPermissionUpdateError extends PermissionServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPermissionUpdateError';
  }
}

export class InvalidPermissionStateError extends PermissionServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPermissionStateError';
  }
}
