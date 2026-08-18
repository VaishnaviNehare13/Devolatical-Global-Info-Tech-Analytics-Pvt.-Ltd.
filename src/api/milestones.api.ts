import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  MilestoneSummary,
  MilestoneDetail,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  FindMilestonesQuery,
} from '../types/milestone';

/**
 * Milestones API Service Module.
 * Communicates with backend /api/v1/projects/:projectId/milestones nested routes.
 */
export const milestonesApi = {
  /**
   * List, filter, and paginate milestones for a given project.
   * GET /api/v1/projects/:projectId/milestones
   */
  listMilestones: (
    projectId: string,
    params?: FindMilestonesQuery
  ): Promise<PaginatedResponse<MilestoneSummary>> =>
    apiClient.get<PaginatedResponse<MilestoneSummary>>(
      `/projects/${projectId}/milestones`,
      { params }
    ),

  /**
   * Get single milestone details by ID.
   * GET /api/v1/projects/:projectId/milestones/:id
   */
  getMilestoneById: (
    projectId: string,
    id: string
  ): Promise<ApiResponse<MilestoneDetail>> =>
    apiClient.get<ApiResponse<MilestoneDetail>>(
      `/projects/${projectId}/milestones/${id}`
    ),

  /**
   * Create a new milestone within a project (Admin only).
   * POST /api/v1/projects/:projectId/milestones
   */
  createMilestone: (
    projectId: string,
    data: CreateMilestoneRequest
  ): Promise<ApiResponse<MilestoneDetail>> =>
    apiClient.post<ApiResponse<MilestoneDetail>>(
      `/projects/${projectId}/milestones`,
      data
    ),

  /**
   * Update milestone details (Admin only).
   * PATCH /api/v1/projects/:projectId/milestones/:id
   */
  updateMilestone: (
    projectId: string,
    id: string,
    data: UpdateMilestoneRequest
  ): Promise<ApiResponse<MilestoneDetail>> =>
    apiClient.patch<ApiResponse<MilestoneDetail>>(
      `/projects/${projectId}/milestones/${id}`,
      data
    ),

  /**
   * Archive (soft delete) a milestone (Admin only).
   * DELETE /api/v1/projects/:projectId/milestones/:id
   */
  archiveMilestone: (projectId: string, id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(
      `/projects/${projectId}/milestones/${id}`
    ),

  /**
   * Restore an archived milestone back to active status (Admin only).
   * POST /api/v1/projects/:projectId/milestones/:id/restore
   */
  restoreMilestone: (
    projectId: string,
    id: string
  ): Promise<ApiResponse<MilestoneDetail>> =>
    apiClient.post<ApiResponse<MilestoneDetail>>(
      `/projects/${projectId}/milestones/${id}/restore`
    ),
};
