import { ServiceError } from '../../../shared/types/service.error';

/**
 * Base service exception class for all Role-Permission Mapping Module workflows.
 */
export class RolePermissionServiceError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'RolePermissionServiceError';
  }
}

export class MappingNotFoundError extends RolePermissionServiceError {
  constructor(message: string = 'Role-Permission mapping not found.') {
    super(message);
    this.name = 'MappingNotFoundError';
  }
}

export class RolePermissionAlreadyExistsError extends RolePermissionServiceError {
  constructor(message: string = 'Role-Permission mapping already exists.') {
    super(message);
    this.name = 'RolePermissionAlreadyExistsError';
  }
}

export class ProtectedRoleMappingError extends RolePermissionServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ProtectedRoleMappingError';
  }
}

export class InvalidMappingUpdateError extends RolePermissionServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMappingUpdateError';
  }
}

export class InvalidMappingStateError extends RolePermissionServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMappingStateError';
  }
}
