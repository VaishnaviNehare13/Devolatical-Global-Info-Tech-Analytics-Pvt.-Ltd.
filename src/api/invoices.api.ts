import { apiClient, getApiBaseUrl, getAccessToken, buildQueryString } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  InvoiceItem,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  FindInvoicesQuery,
} from '../types/invoice';

export type { InvoiceItem, CreateInvoiceRequest, UpdateInvoiceRequest, FindInvoicesQuery };

/**
 * Helper function to fetch binary/blob file response with auth header.
 */
async function fetchBlob(endpoint: string, params?: Record<string, unknown>): Promise<Blob> {
  const baseUrl = getApiBaseUrl();
  const queryString = buildQueryString(params);
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl.replace(/\/+$/, '')}${normalizedEndpoint}${queryString}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, { headers });
  if (!response.ok) {
    throw new Error(`Invoice PDF download request failed with status ${response.status} (${response.statusText})`);
  }
  return response.blob();
}

/**
 * Helper function to trigger browser file download from Blob response.
 */
function triggerBlobDownload(blob: Blob, fallbackFilename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fallbackFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Invoices & Financial Management API Service Module.
 * Communicates with backend /api/v1/invoices routes.
 */
export const invoicesApi = {
  /**
   * List, search, filter, and paginate invoice records (Admin only).
   * GET /api/v1/invoices
   */
  listInvoices: (params?: FindInvoicesQuery): Promise<PaginatedResponse<InvoiceItem>> =>
    apiClient.get<PaginatedResponse<InvoiceItem>>('/invoices', { params }),

  /**
   * Get single invoice record details by ID (Admin only).
   * GET /api/v1/invoices/:id
   */
  getInvoiceById: (id: string): Promise<ApiResponse<InvoiceItem>> =>
    apiClient.get<ApiResponse<InvoiceItem>>(`/invoices/${id}`),

  /**
   * Download server-generated Invoice PDF statement (Admin only).
   * GET /api/v1/invoices/:id/pdf
   */
  downloadInvoicePdf: async (id: string, invoiceNumber?: string): Promise<void> => {
    const blob = await fetchBlob(`/invoices/${id}/pdf`);
    triggerBlobDownload(blob, `Invoice-${invoiceNumber || id}.pdf`);
  },

  /**
   * Create a new invoice statement (Admin only).
   * POST /api/v1/invoices
   */
  createInvoice: (data: CreateInvoiceRequest): Promise<ApiResponse<InvoiceItem>> =>
    apiClient.post<ApiResponse<InvoiceItem>>('/invoices', data),

  /**
   * Update existing invoice statement details/status (Admin only).
   * PATCH /api/v1/invoices/:id
   */
  updateInvoice: (id: string, data: UpdateInvoiceRequest): Promise<ApiResponse<InvoiceItem>> =>
    apiClient.patch<ApiResponse<InvoiceItem>>(`/invoices/${id}`, data),

  /**
   * Delete an invoice statement (Admin only).
   * DELETE /api/v1/invoices/:id
   */
  deleteInvoice: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/invoices/${id}`),
};
