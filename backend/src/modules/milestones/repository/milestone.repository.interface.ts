import {
  CreateMilestoneRepositoryInput,
  UpdateMilestoneRepositoryInput,
  MilestoneDetailOutput,
  FindMilestonesRepositoryOptions,
  MilestoneFiltersInput,
  PaginatedMilestonesOutput,
  QueryOptions,
} from './milestone.repository.types';

export interface IMilestoneRepository {
  create(data: CreateMilestoneRepositoryInput): Promise<MilestoneDetailOutput>;
  findById(id: string, options?: QueryOptions): Promise<MilestoneDetailOutput | null>;
  findMany(options: FindMilestonesRepositoryOptions): Promise<PaginatedMilestonesOutput>;
  count(filters: MilestoneFiltersInput): Promise<number>;
  update(id: string, data: UpdateMilestoneRepositoryInput): Promise<MilestoneDetailOutput | null>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<MilestoneDetailOutput>;
  existsByTitleInProject(title: string, projectId: string): Promise<boolean>;
  findByTitleInProject(title: string, projectId: string): Promise<MilestoneDetailOutput | null>;
}
