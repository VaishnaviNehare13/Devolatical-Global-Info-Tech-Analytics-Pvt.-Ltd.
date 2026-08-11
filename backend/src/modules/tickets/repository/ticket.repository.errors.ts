import { RepositoryError } from '../../../shared/types/repository.error';

export class TicketRepositoryError extends RepositoryError {
  constructor(code: string, message: string, rawError?: unknown) {
    super(code, message, rawError);
    this.name = 'TicketRepositoryError';
  }
}
