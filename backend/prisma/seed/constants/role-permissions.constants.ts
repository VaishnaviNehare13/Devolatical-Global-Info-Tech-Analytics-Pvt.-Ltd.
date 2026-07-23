import { ROLE_CODES } from './roles.constants';

export interface RolePermissionMapping {
  roleCode: string;
  permissions: string[];
}

export const ROLE_PERMISSION_MAPPINGS: RolePermissionMapping[] = [
  {
    roleCode: ROLE_CODES.SUPER_ADMIN,
    permissions: [
      'USER_CREATE',
      'USER_READ',
      'USER_UPDATE',
      'USER_DELETE',
      'ROLE_CREATE',
      'ROLE_READ',
      'ROLE_UPDATE',
      'ROLE_DELETE',
      'PERMISSION_CREATE',
      'PERMISSION_READ',
      'PERMISSION_UPDATE',
      'PERMISSION_DELETE',
    ],
  },
  {
    roleCode: ROLE_CODES.ADMIN,
    permissions: [
      'USER_CREATE',
      'USER_READ',
      'USER_UPDATE',
      'USER_DELETE',
      'ROLE_CREATE',
      'ROLE_READ',
      'ROLE_UPDATE',
      'ROLE_DELETE',
      'PERMISSION_CREATE',
      'PERMISSION_READ',
      'PERMISSION_UPDATE',
      'PERMISSION_DELETE',
    ],
  },
  {
    roleCode: ROLE_CODES.EMPLOYEE,
    permissions: [],
  },
];
