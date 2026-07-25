/**
 * Centralized Prisma Select Definitions for the Authentication Repository.
 * Using read-only definitions avoids duplicated select configurations.
 */

export const AUTH_USER_SELECT = {
  id: true,
  email: true,
  status: true,
  credentials: {
    select: {
      passwordHash: true,
      lastLoginAt: true,
    },
  },
  assignedRoles: {
    where: {
      isActive: true,
    },
    select: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

export const USER_IDENTITY_SELECT = {
  id: true,
  email: true,
  status: true,
  firstName: true,
  lastName: true,
  displayName: true,
} as const;
