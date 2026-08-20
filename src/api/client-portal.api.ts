import { apiClient } from './client';
import type { ApiResponse } from '../types/api';

export interface ClientOverviewData {
  systemStatus: string;
  dataVolume: string;
  activeProjectsCount: number;
  pendingInvoiceTotal: number;
  openTicketsCount: number;
  activePipelines: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
  }>;
  projectMilestones: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
  }>;
}

export interface ClientProjectItem {
  id: string;
  name: string;
  code: string;
  status: string;
  startDate?: string;
  endDate?: string;
  client?: { id: string; name: string };
  milestones?: Array<{ id: string; title: string; status: string }>;
  tasks?: Array<{ id: string; title: string; status: string; priority: string; dueDate?: string }>;
}

export interface ClientInvoiceItem {
  id: string;
  invoiceNumber: string;
  description?: string;
  amount: number | string;
  currency: string;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  project?: { id: string; name: string; code: string };
}

export interface ClientTicketItem {
  id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
}

export interface CreateClientTicketRequest {
  subject: string;
  description: string;
  priority?: string;
  projectId?: string;
}

export const clientPortalApi = {
  getOverview: (): Promise<ApiResponse<ClientOverviewData>> =>
    apiClient.get<ApiResponse<ClientOverviewData>>('/client-portal/overview'),

  getProjects: (): Promise<ApiResponse<ClientProjectItem[]>> =>
    apiClient.get<ApiResponse<ClientProjectItem[]>>('/client-portal/projects'),

  getInvoices: (): Promise<ApiResponse<ClientInvoiceItem[]>> =>
    apiClient.get<ApiResponse<ClientInvoiceItem[]>>('/client-portal/invoices'),

  getTickets: (): Promise<ApiResponse<ClientTicketItem[]>> =>
    apiClient.get<ApiResponse<ClientTicketItem[]>>('/client-portal/tickets'),

  createTicket: (data: CreateClientTicketRequest): Promise<ApiResponse<ClientTicketItem>> =>
    apiClient.post<ApiResponse<ClientTicketItem>>('/client-portal/tickets', data),
};
