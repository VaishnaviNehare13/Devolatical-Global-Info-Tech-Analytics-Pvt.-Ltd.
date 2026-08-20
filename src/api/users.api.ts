import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  UserProfile,
  UserSummary,
  UpdateProfileRequest,
  UpdateUserStatusRequest,
  FindUsersQuery,
} from '../types/user';

/**
 * Users API Service Module.
 * Communicates with backend /api/v1/users routes.
 */
export const usersApi = {
  /**
   * Fetch current authenticated user's profile details.
   * GET /api/v1/users/me
   */
  getMyProfile: (): Promise<ApiResponse<UserProfile>> =>
    apiClient.get<ApiResponse<UserProfile>>('/users/me'),

  /**
   * Update current authenticated user's profile details.
   * PATCH /api/v1/users/me
   */
  updateMyProfile: (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> =>
    apiClient.patch<ApiResponse<UserProfile>>('/users/me', data),

  /**
   * List, search, filter, and paginate users directory (Admin only).
   * GET /api/v1/users
   */
  getUsers: (params?: FindUsersQuery): Promise<PaginatedResponse<UserSummary>> =>
    apiClient.get<PaginatedResponse<UserSummary>>('/users', { params }),

  /**
   * Retrieve single user details by ID (Admin only).
   * GET /api/v1/users/:id
   */
  getUserById: (id: string): Promise<ApiResponse<UserSummary>> =>
    apiClient.get<ApiResponse<UserSummary>>(`/users/${id}`),

  /**
   * Update status of a user (Admin only).
   * PATCH /api/v1/users/:id/status
   */
  updateUserStatus: (
    id: string,
    data: UpdateUserStatusRequest
  ): Promise<ApiResponse<UserSummary>> =>
    apiClient.patch<ApiResponse<UserSummary>>(`/users/${id}/status`, data),

  /**
   * Soft-delete a user profile (Admin only).
   * DELETE /api/v1/users/:id
   */
  softDeleteUser: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/users/${id}`),

  /**
   * Fetch current authenticated user's preferences.
   * GET /api/v1/users/me/preferences
   */
  getMyPreferences: (): Promise<ApiResponse<any>> =>
    apiClient.get<ApiResponse<any>>('/users/me/preferences'),

  /**
   * Update current authenticated user's preferences.
   * PATCH /api/v1/users/me/preferences
   */
  updateMyPreferences: (data: any): Promise<ApiResponse<any>> =>
    apiClient.patch<ApiResponse<any>>('/users/me/preferences', data),
};
