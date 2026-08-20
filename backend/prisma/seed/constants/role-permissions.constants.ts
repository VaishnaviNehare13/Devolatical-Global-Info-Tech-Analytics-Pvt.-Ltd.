import { ROLE_CODES } from './roles.constants';
import { IDENTITY_PERMISSIONS } from './permissions.constants';

export interface RolePermissionMapping {
  roleCode: string;
  permissions: string[];
}

export const ROLE_PERMISSION_MAPPINGS: RolePermissionMapping[] = [
  {
    roleCode: ROLE_CODES.SUPER_ADMIN,
    permissions: IDENTITY_PERMISSIONS.map((p) => p.code),
  },
  {
    roleCode: ROLE_CODES.ADMIN,
    permissions: IDENTITY_PERMISSIONS.map((p) => p.code),
  },
  {
    roleCode: ROLE_CODES.EMPLOYEE,
    permissions: [
      'PROJECT_READ',
      'PROJECT_UPDATE',
      'TASK_CREATE',
      'TASK_READ',
      'TASK_UPDATE',
      'DOCUMENT_READ',
      'DOCUMENT_DOWNLOAD',
      'TICKET_READ',
      'TICKET_UPDATE',
    ],
  },
  {
    roleCode: ROLE_CODES.CLIENT,
    permissions: [],
  },
];
