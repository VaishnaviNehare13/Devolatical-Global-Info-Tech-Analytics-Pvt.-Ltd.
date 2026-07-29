/**
 * DTO validation default constraints for the Audit Logs module.
 */
export const AUDIT_LOG_VALIDATION = {
  ALLOWED_SORT_FIELDS: ['createdAt', 'severity', 'module', 'action'] as const,
  ALLOWED_SORT_ORDERS: ['asc', 'desc'] as const,
} as const;
