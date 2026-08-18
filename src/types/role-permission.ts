import type { BaseQueryParams } from './api';

export interface RolePermissionMapping {
  id: string;
  roleId: string;
  permissionId: string;
  isGranted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role?: {
    id: string;
    name: string;
    code: string;
  };
  permission?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
  isGranted?: boolean;
}

export interface ReplacePermissionsRequest {
  permissionIds: string[];
  isGranted?: boolean;
}

export interface FindRolePermissionsQuery extends BaseQueryParams {
  permissionId?: string;
  isGranted?: boolean;
  includeDeleted?: boolean;
}
