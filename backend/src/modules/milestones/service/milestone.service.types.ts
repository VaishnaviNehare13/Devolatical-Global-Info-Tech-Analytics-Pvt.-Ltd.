import { MilestoneStatus } from '@prisma/client';

export interface CreateMilestoneServiceInput {
  title: string;
  description?: string | null;
  status?: MilestoneStatus;
  projectId: string;
  dueDate?: Date | null;
}

export interface UpdateMilestoneServiceInput {
  title?: string;
  description?: string | null;
  status?: MilestoneStatus;
  dueDate?: Date | null;
  completedAt?: Date | null;
}

export interface FindMilestonesServiceOptions {
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
