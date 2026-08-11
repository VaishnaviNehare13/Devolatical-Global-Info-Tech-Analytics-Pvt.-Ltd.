/**
 * Reusable constants for task pagination settings.
 */
export const TASK_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Reusable constants for task list sorting rules.
 */
export const TASK_SORT = {
  ALLOWED_FIELDS: [
    'code',
    'title',
    'status',
    'priority',
    'dueDate',
    'estimatedHours',
    'loggedHours',
    'createdAt',
    'updatedAt',
  ] as const,
  DEFAULT_FIELD: 'createdAt',
  DEFAULT_ORDER: 'desc',
} as const;

export type AllowedTaskSortField = (typeof TASK_SORT.ALLOWED_FIELDS)[number];

/**
 * Centralized limits for task fields validation.
 */
export const TASK_VALIDATION = {
  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 150,
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 2000,
} as const;
