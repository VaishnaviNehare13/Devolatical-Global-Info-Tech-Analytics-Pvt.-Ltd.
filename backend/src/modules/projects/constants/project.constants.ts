/**
 * Reusable constants for project pagination settings.
 */
export const PROJECT_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Reusable constants for project list sorting rules.
 */
export const PROJECT_SORT = {
  ALLOWED_FIELDS: [
    'name',
    'code',
    'status',
    'budget',
    'startDate',
    'endDate',
    'createdAt',
    'updatedAt',
  ] as const,
  DEFAULT_FIELD: 'createdAt',
  DEFAULT_ORDER: 'desc',
} as const;

export type AllowedProjectSortField = (typeof PROJECT_SORT.ALLOWED_FIELDS)[number];

/**
 * Centralized limits for project fields validation.
 */
export const PROJECT_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;
