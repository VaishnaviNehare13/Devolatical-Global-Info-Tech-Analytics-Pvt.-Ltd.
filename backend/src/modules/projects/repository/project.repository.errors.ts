import { RepositoryError } from '../../../shared/types/repository.error';

export type ProjectRepositoryErrorCode =
  | 'DATABASE_READ_FAILED'
  | 'DATABASE_WRITE_FAILED'
  | 'DATABASE_UPDATE_FAILED'
  | 'DATABASE_DELETE_FAILED';

export class ProjectRepositoryError extends RepositoryError {
  constructor(code: ProjectRepositoryErrorCode, message: string, cause?: unknown) {
    super(code, message, cause);
    this.name = 'ProjectRepositoryError';
  }
}
