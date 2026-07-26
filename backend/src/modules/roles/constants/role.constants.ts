export const ROLE_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const ROLE_SORT = {
  ALLOWED_FIELDS: ['createdAt', 'name', 'code', 'priority'] as const,
  DEFAULT_FIELD: 'createdAt' as const,
  DEFAULT_ORDER: 'desc' as const,
} as const;

export const ROLE_SYSTEM = {
  SUPER_ADMIN_ROLE_CODE: 'SUPER_ADMIN',
  ADMIN_ROLE_CODE: 'ADMIN',
  EMPLOYEE_ROLE_CODE: 'EMPLOYEE',
} as const;

export const ROLE_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 255,
  PRIORITY_MIN: 0,
} as const;
