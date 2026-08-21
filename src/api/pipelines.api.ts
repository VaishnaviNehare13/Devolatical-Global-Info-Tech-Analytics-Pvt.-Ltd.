import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  DataPipeline,
  PipelineTelemetryMetrics,
  CreatePipelineRequest,
  UpdatePipelineRequest,
  UpdatePipelineStatusRequest,
  FindPipelinesQuery,
} from '../types/pipeline';

/**
 * Data Pipelines API Service Module.
 * Communicates with backend /api/v1/pipelines routes.
 */
export const pipelinesApi = {
  /**
   * Get telemetry metrics summary for data pipelines.
   * GET /api/v1/pipelines/metrics
   */
  getTelemetryMetrics: (): Promise<ApiResponse<PipelineTelemetryMetrics>> =>
    apiClient.get<ApiResponse<PipelineTelemetryMetrics>>('/pipelines/metrics'),

  /**
   * List, search, filter, and paginate data pipelines.
   * GET /api/v1/pipelines
   */
  listPipelines: (params?: FindPipelinesQuery): Promise<PaginatedResponse<DataPipeline>> =>
    apiClient.get<PaginatedResponse<DataPipeline>>('/pipelines', { params }),

  /**
   * Get single data pipeline details by ID.
   * GET /api/v1/pipelines/:id
   */
  getPipelineById: (id: string): Promise<ApiResponse<DataPipeline>> =>
    apiClient.get<ApiResponse<DataPipeline>>(`/pipelines/${id}`),

  /**
   * Create a new data pipeline specification.
   * POST /api/v1/pipelines
   */
  createPipeline: (data: CreatePipelineRequest): Promise<ApiResponse<DataPipeline>> =>
    apiClient.post<ApiResponse<DataPipeline>>('/pipelines', data),

  /**
   * Update data pipeline properties.
   * PATCH /api/v1/pipelines/:id
   */
  updatePipeline: (id: string, data: UpdatePipelineRequest): Promise<ApiResponse<DataPipeline>> =>
    apiClient.patch<ApiResponse<DataPipeline>>(`/pipelines/${id}`, data),

  /**
   * Update status or record error message for a data pipeline.
   * PATCH /api/v1/pipelines/:id/status
   */
  updatePipelineStatus: (
    id: string,
    data: UpdatePipelineStatusRequest
  ): Promise<ApiResponse<DataPipeline>> =>
    apiClient.patch<ApiResponse<DataPipeline>>(`/pipelines/${id}/status`, data),

  /**
   * Archive (soft-delete) a data pipeline.
   * DELETE /api/v1/pipelines/:id
   */
  deletePipeline: (id: string): Promise<ApiResponse<{ success: boolean }>> =>
    apiClient.delete<ApiResponse<{ success: boolean }>>(`/pipelines/${id}`),
};
