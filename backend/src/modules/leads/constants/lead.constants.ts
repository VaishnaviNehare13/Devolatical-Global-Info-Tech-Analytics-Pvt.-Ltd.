/**
 * Reusable constants for lead pagination settings.
 */
export const LEAD_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Reusable constants for lead list sorting rules.
 */
export const LEAD_SORT = {
  ALLOWED_FIELDS: [
    'name',
    'companyName',
    'status',
    'priority',
    'source',
    'createdAt',
    'updatedAt',
  ] as const,
  DEFAULT_FIELD: 'createdAt',
  DEFAULT_ORDER: 'desc',
} as const;

export type AllowedLeadSortField = (typeof LEAD_SORT.ALLOWED_FIELDS)[number];

/**
 * Centralized limits for lead fields validation.
 */
export const LEAD_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  COMPANY_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  INDUSTRY_MAX_LENGTH: 50,
  NOTES_MAX_LENGTH: 1000,
  EMAIL_MAX_LENGTH: 100,
} as const;
