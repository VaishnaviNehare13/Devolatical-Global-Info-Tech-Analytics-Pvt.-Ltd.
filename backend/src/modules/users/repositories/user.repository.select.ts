/**
 * Centralized Prisma Select Definitions for the User Repository.
 * Using read-only definitions avoids duplicated select configurations and maintains schema isolation.
 */

export const USER_PROFILE_SELECT = {
  id: true,
  firstName: true,
  middleName: true,
  lastName: true,
  displayName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  emailVerified: true,
  phoneVerified: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  assignedRoles: {
    where: {
      isActive: true,
    },
    select: {
      role: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
} as const;

export const USER_SUMMARY_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  displayName: true,
  email: true,
  status: true,
  avatarUrl: true,
  createdAt: true,
  assignedRoles: {
    where: {
      isActive: true,
    },
    select: {
      role: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
} as const;

export const USER_LIST_SELECT = USER_SUMMARY_SELECT;
