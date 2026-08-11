import {
  CreateTicketRepositoryInput,
  UpdateTicketRepositoryInput,
  TicketDetailOutput,
  FindTicketsRepositoryOptions,
  TicketFiltersInput,
  PaginatedTicketsOutput,
  QueryOptions,
} from './ticket.repository.types';

export interface ITicketRepository {
  create(data: CreateTicketRepositoryInput): Promise<TicketDetailOutput>;
  findById(id: string, options?: QueryOptions): Promise<TicketDetailOutput | null>;
  findMany(options: FindTicketsRepositoryOptions): Promise<PaginatedTicketsOutput>;
  count(filters: TicketFiltersInput): Promise<number>;
  update(id: string, data: UpdateTicketRepositoryInput): Promise<TicketDetailOutput | null>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<TicketDetailOutput>;
}
