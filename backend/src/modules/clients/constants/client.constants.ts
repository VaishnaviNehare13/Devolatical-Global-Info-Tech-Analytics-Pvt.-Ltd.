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
