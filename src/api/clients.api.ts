import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  ClientSummary,
  ClientDetail,
  CreateClientRequest,
  UpdateClientRequest,
  FindClientsQuery,
} from '../types/client';

/**
 * Clients API Service Module.
 * Communicates with backend /api/v1/clients routes.
 */
export const clientsApi = {
  /**
   * List, search, filter, and paginate client accounts (Admin only).
   * GET /api/v1/clients
   */
  listClients: (params?: FindClientsQuery): Promise<PaginatedResponse<ClientSummary>> =>
    apiClient.get<PaginatedResponse<ClientSummary>>('/clients', { params }),

  /**
   * Get detailed client information by ID (Admin only).
   * GET /api/v1/clients/:id
   */
  getClientById: (id: string): Promise<ApiResponse<ClientDetail>> =>
    apiClient.get<ApiResponse<ClientDetail>>(`/clients/${id}`),

  /**
   * Create a new client account (Admin only).
   * POST /api/v1/clients
   */
  createClient: (data: CreateClientRequest): Promise<ApiResponse<ClientDetail>> =>
    apiClient.post<ApiResponse<ClientDetail>>('/clients', data),

  /**
   * Update existing client details (Admin only).
   * PATCH /api/v1/clients/:id
   */
  updateClient: (id: string, data: UpdateClientRequest): Promise<ApiResponse<ClientDetail>> =>
    apiClient.patch<ApiResponse<ClientDetail>>(`/clients/${id}`, data),

  /**
   * Archive (soft delete) a client account (Admin only).
   * DELETE /api/v1/clients/:id
   */
  archiveClient: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/clients/${id}`),

  /**
   * Restore an archived client account (Admin only).
   * POST /api/v1/clients/:id/restore
   */
  restoreClient: (id: string): Promise<ApiResponse<ClientDetail>> =>
    apiClient.post<ApiResponse<ClientDetail>>(`/clients/${id}/restore`),
};
