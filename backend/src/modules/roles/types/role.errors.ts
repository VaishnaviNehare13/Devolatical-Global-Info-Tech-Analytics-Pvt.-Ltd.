import { RepositoryError } from '../../../shared/types/repository.error';

/**
 * Roles Module specific database operation exception.
 */
export class RoleRepositoryError extends RepositoryError {
  constructor(code: string, message: string, cause?: unknown) {
    super(code, message, cause);
    this.name = 'RoleRepositoryError';
  }
}
