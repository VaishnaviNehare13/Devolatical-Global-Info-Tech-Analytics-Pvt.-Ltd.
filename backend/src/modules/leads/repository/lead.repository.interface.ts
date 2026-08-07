import {
  CreateLeadRepositoryInput,
  UpdateLeadRepositoryInput,
  LeadDetailOutput,
  FindLeadsRepositoryOptions,
  LeadFiltersInput,
  PaginatedLeadsOutput,
  QueryOptions,
} from './lead.repository.types';

export interface ILeadRepository {
  create(data: CreateLeadRepositoryInput): Promise<LeadDetailOutput>;
  findById(id: string, options?: QueryOptions): Promise<LeadDetailOutput | null>;
  findByEmail(email: string, options?: QueryOptions): Promise<LeadDetailOutput | null>;
  findMany(options: FindLeadsRepositoryOptions): Promise<PaginatedLeadsOutput>;
  count(filters: LeadFiltersInput): Promise<number>;
  update(id: string, data: UpdateLeadRepositoryInput): Promise<LeadDetailOutput | null>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<LeadDetailOutput>;
  existsByEmail(email: string): Promise<boolean>;
}
