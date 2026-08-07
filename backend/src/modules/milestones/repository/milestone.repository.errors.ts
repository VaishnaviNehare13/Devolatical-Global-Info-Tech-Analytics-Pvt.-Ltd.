import { RepositoryError } from '../../../shared/types/repository.error';

export class MilestoneRepositoryError extends RepositoryError {
  constructor(code: string, message: string, rawError?: unknown) {
    super(code, message, rawError);
    this.name = 'MilestoneRepositoryError';
  }
}
