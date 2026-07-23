/**
 * System Roles Constants
 */

export const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_PRIORITIES = {
  [ROLE_CODES.SUPER_ADMIN]: 100,
  [ROLE_CODES.ADMIN]: 90,
  [ROLE_CODES.EMPLOYEE]: 10,
};
