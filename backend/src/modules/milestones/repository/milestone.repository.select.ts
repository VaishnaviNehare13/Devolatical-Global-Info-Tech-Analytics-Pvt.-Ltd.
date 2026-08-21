/**
 * Centralized Prisma Select configurations for Milestone queries.
 */

export const MILESTONE_BASE_SELECT = {
  id: true,
  title: true,
  status: true,
  reviewStatus: true,
  submittedForReviewAt: true,
  submittedById: true,
  approvedAt: true,
  approvedById: true,
  revisionNotes: true,
  projectId: true,
  dueDate: true,
  completedAt: true,
  createdAt: true,
} as const;

export const MILESTONE_DETAIL_SELECT = {
  ...MILESTONE_BASE_SELECT,
  description: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
  deletedAt: true,
} as const;
