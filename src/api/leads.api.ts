import { apiClient } from './client';
import type { ApiResponse } from '../types/api';

export interface CreateLeadRequest {
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string;
  priority?: string;
  source?: string | null;
  industry?: string | null;
  notes?: string | null;
}

export interface UpdateLeadRequest {
  name?: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string;
  priority?: string;
  source?: string | null;
  industry?: string | null;
  notes?: string | null;
  assignedToId?: string | null;
}

export interface FindLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface LeadResponseItem {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  priority: string;
  source?: string | null;
  industry?: string | null;
  notes?: string | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    displayName: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PaginatedLeadsResponse {
  items: LeadResponseItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export const leadsApi = {
  createLead: (data: CreateLeadRequest): Promise<ApiResponse<LeadResponseItem>> =>
    apiClient.post<ApiResponse<LeadResponseItem>>('/leads', data),

  getLeads: (params?: FindLeadsParams): Promise<ApiResponse<PaginatedLeadsResponse>> =>
    apiClient.get<ApiResponse<PaginatedLeadsResponse>>('/leads', { params: params as Record<string, unknown> }),

  getLeadById: (id: string): Promise<ApiResponse<LeadResponseItem>> =>
    apiClient.get<ApiResponse<LeadResponseItem>>(`/leads/${id}`),

  updateLead: (id: string, data: UpdateLeadRequest): Promise<ApiResponse<LeadResponseItem>> =>
    apiClient.patch<ApiResponse<LeadResponseItem>>(`/leads/${id}`, data),

  archiveLead: (id: string): Promise<void> =>
    apiClient.delete(`/leads/${id}`),

  restoreLead: (id: string): Promise<ApiResponse<LeadResponseItem>> =>
    apiClient.post<ApiResponse<LeadResponseItem>>(`/leads/${id}/restore`),
};
