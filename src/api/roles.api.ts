import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  RoleSummary,
  RoleDetails,
  CreateRoleRequest,
  UpdateRoleRequest,
  UpdateRoleStatusRequest,
  FindRolesQuery,
} from '../types/role';
import type {
  RolePermissionMapping,
  AssignPermissionsRequest,
  ReplacePermissionsRequest,
  FindRolePermissionsQuery,
} from '../types/role-permission';

/**
 * Roles and Role-Permissions API Service Module.
 * Communicates with backend /api/v1/roles and /api/v1/roles/:roleId/permissions routes (Admin only).
 */
export const rolesApi = {
  /**
   * List, search, and paginate system and custom roles.
   * GET /api/v1/roles
   */
  getRoles: (params?: FindRolesQuery): Promise<PaginatedResponse<RoleSummary>> =>
    apiClient.get<PaginatedResponse<RoleSummary>>('/roles', { params }),

  /**
   * Get role details with assigned permissions by ID.
   * GET /api/v1/roles/:id
   */
  getRoleById: (id: string): Promise<ApiResponse<RoleDetails>> =>
    apiClient.get<ApiResponse<RoleDetails>>(`/roles/${id}`),

  /**
   * Create a new custom role.
   * POST /api/v1/roles
   */
  createRole: (data: CreateRoleRequest): Promise<ApiResponse<RoleSummary>> =>
    apiClient.post<ApiResponse<RoleSummary>>('/roles', data),

  /**
   * Update existing role definition.
   * PATCH /api/v1/roles/:id
   */
  updateRole: (id: string, data: UpdateRoleRequest): Promise<ApiResponse<RoleSummary>> =>
    apiClient.patch<ApiResponse<RoleSummary>>(`/roles/${id}`, data),

  /**
   * Toggle role active status.
   * PATCH /api/v1/roles/:id/status
   */
  updateRoleStatus: (
    id: string,
    data: UpdateRoleStatusRequest
  ): Promise<ApiResponse<RoleSummary>> =>
    apiClient.patch<ApiResponse<RoleSummary>>(`/roles/${id}/status`, data),

  /**
   * Delete a custom role.
   * DELETE /api/v1/roles/:id
   */
  deleteRole: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/roles/${id}`),

  /**
   * List permissions assigned to a role.
   * GET /api/v1/roles/:roleId/permissions
   */
  getRolePermissions: (
    roleId: string,
    params?: FindRolePermissionsQuery
  ): Promise<PaginatedResponse<RolePermissionMapping>> =>
    apiClient.get<PaginatedResponse<RolePermissionMapping>>(
      `/roles/${roleId}/permissions`,
      { params }
    ),

  /**
   * Assign permissions to a role.
   * POST /api/v1/roles/:roleId/permissions
   */
  assignPermissions: (
    roleId: string,
    data: AssignPermissionsRequest
  ): Promise<ApiResponse<RolePermissionMapping[]>> =>
    apiClient.post<ApiResponse<RolePermissionMapping[]>>(
      `/roles/${roleId}/permissions`,
      data
    ),

  /**
   * Synchronize/replace all permissions mapped to a role.
   * PUT /api/v1/roles/:roleId/permissions
   */
  replacePermissions: (
    roleId: string,
    data: ReplacePermissionsRequest
  ): Promise<ApiResponse<RolePermissionMapping[]>> =>
    apiClient.put<ApiResponse<RolePermissionMapping[]>>(
      `/roles/${roleId}/permissions`,
      data
    ),

  /**
   * Remove a specific permission assignment from a role.
   * DELETE /api/v1/roles/:roleId/permissions/:permissionId
   */
  removePermission: (roleId: string, permissionId: string): Promise<void> =>
    apiClient.delete<void>(`/roles/${roleId}/permissions/${permissionId}`),
};
