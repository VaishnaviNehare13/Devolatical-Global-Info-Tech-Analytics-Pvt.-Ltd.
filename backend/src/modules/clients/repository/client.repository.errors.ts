import { RepositoryError } from '../../../shared/types/repository.error';

export type ClientRepositoryErrorCode =
  | 'DATABASE_READ_FAILED'
  | 'DATABASE_WRITE_FAILED'
  | 'DATABASE_UPDATE_FAILED'
  | 'DATABASE_DELETE_FAILED';

export class ClientRepositoryError extends RepositoryError {
  constructor(code: ClientRepositoryErrorCode, message: string, cause?: unknown) {
    super(code, message, cause);
    this.name = 'ClientRepositoryError';
  }
}
