import { RepositoryError } from '../../../shared/types/repository.error';

/**
 * Role-Permission Mapping Module specific database operation exception.
 */
export class RolePermissionRepositoryError extends RepositoryError {
  constructor(code: string, message: string, cause?: unknown) {
    super(code, message, cause);
    this.name = 'RolePermissionRepositoryError';
  }
}
