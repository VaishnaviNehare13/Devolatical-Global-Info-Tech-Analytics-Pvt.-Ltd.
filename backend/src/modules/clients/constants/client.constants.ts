/**
 * Reusable constants for client pagination settings.
 */
export const CLIENT_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Reusable constants for client list sorting rules.
 */
export const CLIENT_SORT = {
  ALLOWED_FIELDS: ['name', 'code', 'status', 'createdAt', 'updatedAt'] as const,
  DEFAULT_FIELD: 'createdAt',
  DEFAULT_ORDER: 'desc',
} as const;

export type AllowedClientSortField = (typeof CLIENT_SORT.ALLOWED_FIELDS)[number];

/**
 * centralized limits for client fields validation
 */
export const CLIENT_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 30,
  WEBSITE_MAX_LENGTH: 150,
  ADDRESS_LINE_MAX_LENGTH: 100,
  CITY_MAX_LENGTH: 50,
  STATE_MAX_LENGTH: 50,
  COUNTRY_MAX_LENGTH: 50,
  POSTAL_CODE_MAX_LENGTH: 20,
  NOTES_MAX_LENGTH: 1000,
} as const;
