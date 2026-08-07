/**
 * Reusable constants for milestone pagination settings.
 */
export const MILESTONE_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Reusable constants for milestone list sorting rules.
 */
export const MILESTONE_SORT = {
  ALLOWED_FIELDS: ['title', 'status', 'dueDate', 'completedAt', 'createdAt', 'updatedAt'] as const,
  DEFAULT_FIELD: 'createdAt',
  DEFAULT_ORDER: 'desc',
} as const;

export type AllowedMilestoneSortField = (typeof MILESTONE_SORT.ALLOWED_FIELDS)[number];

/**
 * Centralized limits for milestone fields validation.
 */
export const MILESTONE_VALIDATION = {
  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 150,
  DESCRIPTION_MAX_LENGTH: 2000,
} as const;
