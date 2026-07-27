import { RepositoryError } from '../../../shared/types/repository.error';

/**
 * Permissions Module specific database operation exception.
 */
export class PermissionRepositoryError extends RepositoryError {
  constructor(code: string, message: string, cause?: unknown) {
    super(code, message, cause);
    this.name = 'PermissionRepositoryError';
  }
}
