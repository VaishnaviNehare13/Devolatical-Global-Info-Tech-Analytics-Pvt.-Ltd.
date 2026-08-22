import { apiClient, getApiBaseUrl, getAccessToken, buildQueryString } from './client';
import type { ApiResponse } from '../types/api';
import type { DocumentSummary } from '../types/document';

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

export interface ClientProjectMilestoneItem {
  id: string;
  title: string;
  status: string;
  reviewStatus?: string;
  submittedForReviewAt?: string | null;
  submittedById?: string | null;
  approvedAt?: string | null;
  approvedById?: string | null;
  revisionNotes?: string | null;
  description?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
}

export interface ClientProjectItem {
  id: string;
  name: string;
  code: string;
  status: string;
  startDate?: string;
  endDate?: string;
  client?: { id: string; name: string };
  milestones?: ClientProjectMilestoneItem[];
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

export interface ClientTicketComment {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface ClientTicketDetail extends ClientTicketItem {
  comments?: ClientTicketComment[];
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

  downloadInvoicePdf: async (id: string, invoiceNumber?: string): Promise<void> => {
    const blob = await fetchBlob(`/client-portal/invoices/${id}/pdf`);
    triggerBlobDownload(blob, `Invoice-${invoiceNumber || id}.pdf`);
  },

  getTickets: (): Promise<ApiResponse<ClientTicketItem[]>> =>
    apiClient.get<ApiResponse<ClientTicketItem[]>>('/client-portal/tickets'),

  createTicket: (data: CreateClientTicketRequest): Promise<ApiResponse<ClientTicketItem>> =>
    apiClient.post<ApiResponse<ClientTicketItem>>('/client-portal/tickets', data),

  getTicketById: (id: string): Promise<ApiResponse<ClientTicketDetail>> =>
    apiClient.get<ApiResponse<ClientTicketDetail>>(`/client-portal/tickets/${id}`),

  createTicketComment: (
    id: string,
    data: { message: string }
  ): Promise<ApiResponse<ClientTicketComment>> =>
    apiClient.post<ApiResponse<ClientTicketComment>>(`/client-portal/tickets/${id}/comments`, data),

  getDocuments: (): Promise<ApiResponse<DocumentSummary[]>> =>
    apiClient.get<ApiResponse<DocumentSummary[]>>('/client-portal/documents'),

  downloadDocument: async (id: string, fileName?: string): Promise<void> => {
    const blob = await fetchBlob(`/client-portal/documents/${id}/download`);
    triggerBlobDownload(blob, fileName || `document-${id}`);
  },

  approveMilestone: (id: string): Promise<ApiResponse<ClientProjectMilestoneItem>> =>
    apiClient.post<ApiResponse<ClientProjectMilestoneItem>>(`/client-portal/milestones/${id}/approve`),

  requestMilestoneRevision: (
    id: string,
    revisionNotes: string
  ): Promise<ApiResponse<ClientProjectMilestoneItem>> =>
    apiClient.post<ApiResponse<ClientProjectMilestoneItem>>(`/client-portal/milestones/${id}/request-revision`, {
      revisionNotes,
    }),
};
