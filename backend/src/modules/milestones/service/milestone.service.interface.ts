import {
  MilestoneDetailOutput,
  PaginatedMilestonesOutput,
  MilestoneFiltersInput,
} from '../repository/milestone.repository.types';
import {
  CreateMilestoneServiceInput,
  UpdateMilestoneServiceInput,
  FindMilestonesServiceOptions,
} from './milestone.service.types';

export interface IMilestoneService {
  createMilestone(
    data: CreateMilestoneServiceInput,
    currentUserId: string
  ): Promise<MilestoneDetailOutput>;
  getMilestoneById(id: string): Promise<MilestoneDetailOutput>;
  listMilestones(options: FindMilestonesServiceOptions): Promise<PaginatedMilestonesOutput>;
  updateMilestone(
    id: string,
    data: UpdateMilestoneServiceInput,
    currentUserId: string
  ): Promise<MilestoneDetailOutput>;
  archiveMilestone(id: string, currentUserId: string): Promise<MilestoneDetailOutput>;
  restoreMilestone(id: string, currentUserId: string): Promise<MilestoneDetailOutput>;
  countMilestones(filters: MilestoneFiltersInput): Promise<number>;
}
