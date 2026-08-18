import type { BaseQueryParams } from './api';

export type RoleType = 'SYSTEM' | 'CUSTOM';

export interface RoleSummary {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: RoleType;
  priority: number;
  isActive: boolean;
  isDefault: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionItem {
  id: string;
  name: string;
  code: string;
}

export interface RoleDetails extends RoleSummary {
  permissions: RolePermissionItem[];
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  type?: RoleType;
  priority?: number;
  isDefault?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  priority?: number;
  isDefault?: boolean;
}

export interface UpdateRoleStatusRequest {
  isActive: boolean;
}

export interface FindRolesQuery extends BaseQueryParams {
  status?: boolean;
}
