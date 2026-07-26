export const SYSTEM_PERMISSIONS = {
  // Roles permissions
  VIEW_ROLES: 'roles:view',
  CREATE_ROLE: 'roles:create',
  UPDATE_ROLE: 'roles:update',
  DELETE_ROLE: 'roles:delete',

  // Users permissions
  VIEW_USERS: 'users:view',
  CREATE_USER: 'users:create',
  UPDATE_USER: 'users:update',
  DELETE_USER: 'users:delete',
} as const;

export type SystemPermission = (typeof SYSTEM_PERMISSIONS)[keyof typeof SYSTEM_PERMISSIONS];
