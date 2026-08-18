import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  LeadSummary,
  LeadDetail,
  CreateLeadRequest,
  UpdateLeadRequest,
  FindLeadsQuery,
} from '../types/lead';

/**
 * Leads API Service Module.
 * Communicates with backend /api/v1/leads routes.
 */
export const leadsApi = {
  /**
   * List, search, filter, and paginate CRM pipeline leads.
   * GET /api/v1/leads
   */
  listLeads: (params?: FindLeadsQuery): Promise<PaginatedResponse<LeadSummary>> =>
    apiClient.get<PaginatedResponse<LeadSummary>>('/leads', { params }),

  /**
   * Get detailed lead information by ID.
   * GET /api/v1/leads/:id
   */
  getLeadById: (id: string): Promise<ApiResponse<LeadDetail>> =>
    apiClient.get<ApiResponse<LeadDetail>>(`/leads/${id}`),

  /**
   * Create a new sales pipeline lead.
   * POST /api/v1/leads
   */
  createLead: (data: CreateLeadRequest): Promise<ApiResponse<LeadDetail>> =>
    apiClient.post<ApiResponse<LeadDetail>>('/leads', data),

  /**
   * Update lead details and progression stage.
   * PATCH /api/v1/leads/:id
   */
  updateLead: (id: string, data: UpdateLeadRequest): Promise<ApiResponse<LeadDetail>> =>
    apiClient.patch<ApiResponse<LeadDetail>>(`/leads/${id}`, data),

  /**
   * Archive (soft delete) a lead.
   * DELETE /api/v1/leads/:id
   */
  archiveLead: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/leads/${id}`),

  /**
   * Restore an archived lead back to active status.
   * POST /api/v1/leads/:id/restore
   */
  restoreLead: (id: string): Promise<ApiResponse<LeadDetail>> =>
    apiClient.post<ApiResponse<LeadDetail>>(`/leads/${id}/restore`),
};
