/**
 * Centralized Prisma Select configurations for Lead queries.
 */

export const LEAD_BASE_SELECT = {
  id: true,
  name: true,
  companyName: true,
  email: true,
  phone: true,
  status: true,
  priority: true,
  source: true,
  createdAt: true,
} as const;

export const LEAD_DETAIL_SELECT = {
  ...LEAD_BASE_SELECT,
  industry: true,
  notes: true,
  assignedToId: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
  deletedAt: true,
} as const;
