import type { BaseQueryParams } from './api';

export interface MilestoneSummary {
  id: string;
  title: string;
  status: string;
  projectId: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface MilestoneDetail extends MilestoneSummary {
  description: string | null;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
}

export interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  status?: string;
  dueDate?: string | null;
  completedAt?: string | null;
}

export interface FindMilestonesQuery extends BaseQueryParams {
  status?: string;
}
