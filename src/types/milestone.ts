import type { BaseQueryParams } from './api';

export type MilestoneReviewStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';

export interface MilestoneSummary {
  id: string;
  title: string;
  status: string;
  reviewStatus?: MilestoneReviewStatus | string;
  submittedForReviewAt?: string | null;
  submittedById?: string | null;
  approvedAt?: string | null;
  approvedById?: string | null;
  revisionNotes?: string | null;
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
