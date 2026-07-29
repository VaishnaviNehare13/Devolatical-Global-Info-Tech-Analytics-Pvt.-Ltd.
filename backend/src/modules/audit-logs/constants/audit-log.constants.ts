/**
 * Pagination defaults and constraints for the Audit Logs module.
 */
export const AUDIT_LOG_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Sorting defaults and allowed fields for the Audit Logs module.
 */
export const AUDIT_LOG_SORT = {
  DEFAULT_FIELD: 'createdAt' as const,
  DEFAULT_ORDER: 'desc' as const,
  ALLOWED_FIELDS: ['createdAt', 'severity', 'module', 'action'] as const,
};
