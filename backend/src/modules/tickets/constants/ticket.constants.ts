/**
 * Reusable constants for ticket pagination settings.
 */
export const TICKET_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Reusable constants for ticket list sorting rules.
 */
export const TICKET_SORT = {
  ALLOWED_FIELDS: ['subject', 'status', 'priority', 'createdAt', 'updatedAt'] as const,
  DEFAULT_FIELD: 'createdAt',
  DEFAULT_ORDER: 'desc',
} as const;

export type AllowedTicketSortField = (typeof TICKET_SORT.ALLOWED_FIELDS)[number];

/**
 * Centralized limits for ticket fields validation.
 */
export const TICKET_VALIDATION = {
  SUBJECT_MIN_LENGTH: 2,
  SUBJECT_MAX_LENGTH: 150,
  DESCRIPTION_MAX_LENGTH: 2000,
} as const;
