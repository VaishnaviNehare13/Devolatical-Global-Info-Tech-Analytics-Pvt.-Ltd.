export const ROLE_PERMISSION_VALIDATION = {
  MIN_ASSIGNED_PERMISSIONS: 1,
  MAX_ASSIGNED_PERMISSIONS: 100,
} as const;

export const ROLE_PERMISSION_SORT = {
  ALLOWED_FIELDS: ['createdAt', 'permissionName', 'permissionCode', 'displayOrder'] as const,
  DEFAULT_FIELD: 'createdAt' as const,
  DEFAULT_ORDER: 'desc' as const,
} as const;

export const ROLE_PERMISSION_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
