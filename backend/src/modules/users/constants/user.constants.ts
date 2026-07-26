import { UserStatus } from '../types/user.types';

/**
 * Reusable constants for user pagination settings.
 */
export const USER_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Reusable constants for user list sorting rules.
 */
export const USER_SORT = {
  ALLOWED_FIELDS: ['createdAt', 'displayName', 'email'] as const,
} as const;

export type AllowedSortField = (typeof USER_SORT.ALLOWED_FIELDS)[number];

/**
 * System-wide bootstrap role codes and admin user identifiers.
 */
export const USER_SYSTEM = {
  SUPER_ADMIN_ROLE_CODE: 'SUPER_ADMIN',
  ROOT_ADMIN_EMAIL: 'admin@devolatical.com',
} as const;

/**
 * Centralized business transition map for user statuses.
 * Defines permitted target states for each current status value.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<UserStatus, readonly UserStatus[]> = {
  [UserStatus.ACTIVE]: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED],
  [UserStatus.INACTIVE]: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED],
  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED],
  [UserStatus.ARCHIVED]: [],
} as const;
