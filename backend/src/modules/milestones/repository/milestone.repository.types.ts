import { MilestoneStatus } from '@prisma/client';

export interface CreateMilestoneRepositoryInput {
  title: string;
  description?: string | null;
  status?: MilestoneStatus;
  projectId: string;
  dueDate?: Date | null;
  createdById?: string | null;
}

export interface UpdateMilestoneRepositoryInput {
  title?: string;
  description?: string | null;
  status?: MilestoneStatus;
  dueDate?: Date | null;
  completedAt?: Date | null;
  updatedById?: string | null;
  deletedAt?: Date | null;
}

export interface MilestoneBaseOutput {
  id: string;
  title: string;
  status: MilestoneStatus;
  projectId: string;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface MilestoneDetailOutput extends MilestoneBaseOutput {
  description: string | null;
  createdById: string | null;
  updatedAt: Date;
  updatedById: string | null;
  deletedAt: Date | null;
}

export interface FindMilestonesRepositoryOptions {
  pagination?: {
    page: number;
    limit: number;
  };
  search?: string;
  status?: MilestoneStatus;
  projectId?: string;
  includeDeleted?: boolean;
  sortField?: 'title' | 'status' | 'dueDate' | 'completedAt' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface MilestoneFiltersInput {
  search?: string;
  status?: MilestoneStatus;
  projectId?: string;
  includeDeleted?: boolean;
}

export interface PaginatedMilestonesOutput {
  items: MilestoneBaseOutput[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryOptions {
  includeDeleted?: boolean;
}
