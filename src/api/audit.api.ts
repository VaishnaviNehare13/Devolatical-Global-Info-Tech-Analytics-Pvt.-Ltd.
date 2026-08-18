import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { AuditLog, FindAuditLogsQuery } from '../types/audit';

/**
 * Audit Logs API Service Module.
 * Communicates with backend /api/v1/audit-logs routes (Admin only).
 */
export const auditApi = {
  /**
   * Search, filter, and paginate immutable system audit logs.
   * GET /api/v1/audit-logs
   */
  getAuditLogs: (params?: FindAuditLogsQuery): Promise<PaginatedResponse<AuditLog>> =>
    apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { params }),

  /**
   * Get single audit log record by ID.
   * GET /api/v1/audit-logs/:id
   */
  getAuditLogById: (id: string): Promise<ApiResponse<AuditLog>> =>
    apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`),
};
