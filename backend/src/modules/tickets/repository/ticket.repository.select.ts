/**
 * Centralized Prisma Select configurations for Ticket queries.
 */

export const TICKET_BASE_SELECT = {
  id: true,
  subject: true,
  status: true,
  priority: true,
  category: true,
  assignedToId: true,
  clientId: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const TICKET_DETAIL_SELECT = {
  ...TICKET_BASE_SELECT,
  description: true,
  createdById: true,
  updatedById: true,
  deletedAt: true,
} as const;
