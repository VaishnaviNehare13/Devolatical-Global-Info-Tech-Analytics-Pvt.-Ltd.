import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  TaskSummary,
  TaskDetail,
  CreateTaskRequest,
  UpdateTaskRequest,
  FindTasksQuery,
} from '../types/task';

/**
 * Tasks API Service Module.
 * Communicates with backend /api/v1/tasks routes.
 */
export const tasksApi = {
  /**
   * List, search, filter, and paginate work item tasks.
   * GET /api/v1/tasks
   */
  listTasks: (params?: FindTasksQuery): Promise<PaginatedResponse<TaskSummary>> =>
    apiClient.get<PaginatedResponse<TaskSummary>>('/tasks', { params }),

  /**
   * Get detailed task information by ID.
   * GET /api/v1/tasks/:id
   */
  getTaskById: (id: string): Promise<ApiResponse<TaskDetail>> =>
    apiClient.get<ApiResponse<TaskDetail>>(`/tasks/${id}`),

  /**
   * Create a new task.
   * POST /api/v1/tasks
   */
  createTask: (data: CreateTaskRequest): Promise<ApiResponse<TaskDetail>> =>
    apiClient.post<ApiResponse<TaskDetail>>('/tasks', data),

  /**
   * Update task status, priority, logged hours, or hierarchy.
   * PATCH /api/v1/tasks/:id
   */
  updateTask: (id: string, data: UpdateTaskRequest): Promise<ApiResponse<TaskDetail>> =>
    apiClient.patch<ApiResponse<TaskDetail>>(`/tasks/${id}`, data),

  /**
   * Archive (soft delete) a task.
   * DELETE /api/v1/tasks/:id
   */
  archiveTask: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/tasks/${id}`),

  /**
   * Restore an archived task back to active status.
   * POST /api/v1/tasks/:id/restore
   */
  restoreTask: (id: string): Promise<ApiResponse<TaskDetail>> =>
    apiClient.post<ApiResponse<TaskDetail>>(`/tasks/${id}/restore`),
};
