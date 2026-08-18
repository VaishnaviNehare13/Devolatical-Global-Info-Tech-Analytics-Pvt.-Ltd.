import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  TicketSummary,
  TicketDetail,
  CreateTicketRequest,
  UpdateTicketRequest,
  FindTicketsQuery,
} from '../types/ticket';

/**
 * Tickets API Service Module.
 * Communicates with backend /api/v1/tickets routes.
 */
export const ticketsApi = {
  /**
   * List, search, filter, and paginate support tickets.
   * GET /api/v1/tickets
   */
  listTickets: (params?: FindTicketsQuery): Promise<PaginatedResponse<TicketSummary>> =>
    apiClient.get<PaginatedResponse<TicketSummary>>('/tickets', { params }),

  /**
   * Get detailed ticket information by ID.
   * GET /api/v1/tickets/:id
   */
  getTicketById: (id: string): Promise<ApiResponse<TicketDetail>> =>
    apiClient.get<ApiResponse<TicketDetail>>(`/tickets/${id}`),

  /**
   * Create a new support ticket.
   * POST /api/v1/tickets
   */
  createTicket: (data: CreateTicketRequest): Promise<ApiResponse<TicketDetail>> =>
    apiClient.post<ApiResponse<TicketDetail>>('/tickets', data),

  /**
   * Update ticket status, priority, or assignment.
   * PATCH /api/v1/tickets/:id
   */
  updateTicket: (id: string, data: UpdateTicketRequest): Promise<ApiResponse<TicketDetail>> =>
    apiClient.patch<ApiResponse<TicketDetail>>(`/tickets/${id}`, data),

  /**
   * Archive (soft delete) a support ticket.
   * DELETE /api/v1/tickets/:id
   */
  archiveTicket: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/tickets/${id}`),

  /**
   * Restore an archived ticket back to active status.
   * POST /api/v1/tickets/:id/restore
   */
  restoreTicket: (id: string): Promise<ApiResponse<TicketDetail>> =>
    apiClient.post<ApiResponse<TicketDetail>>(`/tickets/${id}/restore`),
};
