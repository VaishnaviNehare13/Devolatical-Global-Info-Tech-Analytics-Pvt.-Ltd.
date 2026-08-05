/**
 * Centralized Prisma Select configurations for Project queries.
 */

export const PROJECT_BASE_SELECT = {
  id: true,
  name: true,
  code: true,
  status: true,
  clientId: true,
  projectManagerId: true,
  startDate: true,
  endDate: true,
  budget: true,
  createdAt: true,
} as const;

export const PROJECT_DETAIL_SELECT = {
  ...PROJECT_BASE_SELECT,
  description: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
  deletedAt: true,
} as const;
