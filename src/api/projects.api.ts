import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  ProjectSummary,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  FindProjectsQuery,
} from '../types/project';

/**
 * Projects API Service Module.
 * Communicates with backend /api/v1/projects routes.
 */
export const projectsApi = {
  /**
   * List, search, filter, and paginate projects.
   * GET /api/v1/projects
   */
  listProjects: (params?: FindProjectsQuery): Promise<PaginatedResponse<ProjectSummary>> =>
    apiClient.get<PaginatedResponse<ProjectSummary>>('/projects', { params }),

  /**
   * Get detailed project information by ID.
   * GET /api/v1/projects/:id
   */
  getProjectById: (id: string): Promise<ApiResponse<ProjectDetail>> =>
    apiClient.get<ApiResponse<ProjectDetail>>(`/projects/${id}`),

  /**
   * Create a new project profile (Admin only).
   * POST /api/v1/projects
   */
  createProject: (data: CreateProjectRequest): Promise<ApiResponse<ProjectDetail>> =>
    apiClient.post<ApiResponse<ProjectDetail>>('/projects', data),

  /**
   * Update project details (Admin only).
   * PATCH /api/v1/projects/:id
   */
  updateProject: (id: string, data: UpdateProjectRequest): Promise<ApiResponse<ProjectDetail>> =>
    apiClient.patch<ApiResponse<ProjectDetail>>(`/projects/${id}`, data),

  /**
   * Archive (soft delete) a project profile (Admin only).
   * DELETE /api/v1/projects/:id
   */
  archiveProject: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/projects/${id}`),

  /**
   * Restore an archived project back to active planning status (Admin only).
   * POST /api/v1/projects/:id/restore
   */
  restoreProject: (id: string): Promise<ApiResponse<ProjectDetail>> =>
    apiClient.post<ApiResponse<ProjectDetail>>(`/projects/${id}/restore`),
};
