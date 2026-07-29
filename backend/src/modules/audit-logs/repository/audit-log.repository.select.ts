/**
 * Centralized Prisma Select Definitions for the Audit Log Repository.
 * Using read-only definitions avoids duplicated select configurations and maintains schema isolation.
 */
export const AUDIT_LOG_SELECT = {
  id: true,
  userId: true,
  requestId: true,
  module: true,
  action: true,
  entityType: true,
  entityId: true,
  resourceName: true,
  oldValues: true,
  newValues: true,
  metadata: true,
  status: true,
  severity: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
} as const;
