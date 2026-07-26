import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base service exception class for all Roles Module workflows.
 */
export class RoleServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'RoleServiceError';
  }
}

export class RoleNotFoundError extends RoleServiceError {
  constructor(message: string = 'Role not found.') {
    super(message);
    this.name = 'RoleNotFoundError';
  }
}

export class DuplicateRoleNameError extends RoleServiceError {
  constructor(message: string = 'Role name is already in use.') {
    super(message);
    this.name = 'DuplicateRoleNameError';
  }
}

export class DuplicateRoleCodeError extends RoleServiceError {
  constructor(message: string = 'Role code is already in use.') {
    super(message);
    this.name = 'DuplicateRoleCodeError';
  }
}

export class ProtectedRoleError extends RoleServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ProtectedRoleError';
  }
}

export class InvalidRoleStatusError extends RoleServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRoleStatusError';
  }
}

export class RoleInUseError extends RoleServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'RoleInUseError';
  }
}
