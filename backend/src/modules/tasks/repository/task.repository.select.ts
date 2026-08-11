/**
 * Centralized Prisma Select configurations for Task queries.
 */

export const TASK_BASE_SELECT = {
  id: true,
  code: true,
  title: true,
  status: true,
  priority: true,
  projectId: true,
  milestoneId: true,
  assignedToId: true,
  parentId: true,
  estimatedHours: true,
  loggedHours: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const TASK_DETAIL_SELECT = {
  ...TASK_BASE_SELECT,
  description: true,
  createdById: true,
  updatedById: true,
  deletedAt: true,
} as const;
