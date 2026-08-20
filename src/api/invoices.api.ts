import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  description?: string;
  amount: number | string;
  currency: string;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  client?: { id: string; name: string; code: string };
  project?: { id: string; name: string; code: string };
}

export interface FindInvoicesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  clientId?: string;
  projectId?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export const invoicesApi = {
  listInvoices: (params?: FindInvoicesQuery): Promise<PaginatedResponse<InvoiceItem>> =>
    apiClient.get<PaginatedResponse<InvoiceItem>>('/invoices', { params }),

  getInvoiceById: (id: string): Promise<ApiResponse<InvoiceItem>> =>
    apiClient.get<ApiResponse<InvoiceItem>>(`/invoices/${id}`),
};
