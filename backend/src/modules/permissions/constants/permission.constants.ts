export const PERMISSION_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const PERMISSION_SORT = {
  ALLOWED_FIELDS: ['createdAt', 'name', 'code', 'displayOrder'] as const,
  DEFAULT_FIELD: 'createdAt' as const,
  DEFAULT_ORDER: 'desc' as const,
} as const;

export const PERMISSION_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 255,
  DISPLAY_ORDER_MIN: 0,
} as const;
