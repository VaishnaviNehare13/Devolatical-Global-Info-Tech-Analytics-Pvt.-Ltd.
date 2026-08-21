import type { BaseQueryParams } from './api';

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceClientInfo {
  id: string;
  name: string;
  code: string;
}

export interface InvoiceProjectInfo {
  id: string;
  name: string;
  code: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  description?: string | null;
  amount: number | string;
  currency: string;
  status: string;
  dueDate?: string | null;
  paidAt?: string | null;
  clientId: string;
  projectId?: string | null;
  milestoneId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: InvoiceClientInfo;
  project?: InvoiceProjectInfo;
}

export interface CreateInvoiceRequest {
  invoiceNumber: string;
  description?: string;
  amount: number;
  currency?: string;
  status?: string;
  dueDate?: string;
  clientId: string;
  projectId?: string;
  milestoneId?: string;
}

export interface UpdateInvoiceRequest {
  description?: string;
  amount?: number;
  currency?: string;
  status?: string;
  dueDate?: string;
  paidAt?: string;
  milestoneId?: string;
}

export interface FindInvoicesQuery extends BaseQueryParams {
  status?: string;
  clientId?: string;
  projectId?: string;
  milestoneId?: string;
}
