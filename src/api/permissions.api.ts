import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  PermissionSummary,
  PermissionDetails,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  FindPermissionsQuery,
} from '../types/permission';

/**
 * Permissions API Service Module.
 * Communicates with backend /api/v1/permissions routes (Admin only).
 */
export const permissionsApi = {
  /**
   * List, search, and paginate system permissions catalog.
   * GET /api/v1/permissions
   */
  getPermissions: (
    params?: FindPermissionsQuery
  ): Promise<PaginatedResponse<PermissionSummary>> =>
    apiClient.get<PaginatedResponse<PermissionSummary>>('/permissions', { params }),

  /**
   * Get single permission details by ID.
   * GET /api/v1/permissions/:id
   */
  getPermissionById: (id: string): Promise<ApiResponse<PermissionDetails>> =>
    apiClient.get<ApiResponse<PermissionDetails>>(`/permissions/${id}`),

  /**
   * Create a new permission.
   * POST /api/v1/permissions
   */
  createPermission: (
    data: CreatePermissionRequest
  ): Promise<ApiResponse<PermissionSummary>> =>
    apiClient.post<ApiResponse<PermissionSummary>>('/permissions', data),

  /**
   * Update permission details.
   * PATCH /api/v1/permissions/:id
   */
  updatePermission: (
    id: string,
    data: UpdatePermissionRequest
  ): Promise<ApiResponse<PermissionSummary>> =>
    apiClient.patch<ApiResponse<PermissionSummary>>(`/permissions/${id}`, data),

  /**
   * Delete a permission.
   * DELETE /api/v1/permissions/:id
   */
  deletePermission: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/permissions/${id}`),
};
