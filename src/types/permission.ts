import type { BaseQueryParams } from './api';

export interface PermissionSummary {
  id: string;
  name: string;
  code: string;
  description: string | null;
  module: string;
  resource: string;
  action: string;
  isActive: boolean;
  isSystem: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionRoleItem {
  id: string;
  name: string;
  code: string;
}

export interface PermissionDetails extends PermissionSummary {
  roles: PermissionRoleItem[];
}

export interface CreatePermissionRequest {
  name: string;
  code: string;
  description?: string;
  module: string;
  resource: string;
  action: string;
  isSystem?: boolean;
  displayOrder?: number;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  module?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface FindPermissionsQuery extends BaseQueryParams {
  module?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}
