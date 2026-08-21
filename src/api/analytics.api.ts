import { apiClient, getApiBaseUrl, getAccessToken, buildQueryString } from './client';
import type { ApiResponse } from '../types/api';
import type {
  AnalyticsQueryFilters,
  ReportExportQueryFilters,
  AnalyticsOverviewData,
  LeadAnalyticsData,
  FinancialAnalyticsData,
  TicketAnalyticsData,
  ProjectAnalyticsData,
  PipelineAnalyticsData,
} from '../types/analytics';

/**
 * Helper function to fetch binary/blob file response (CSV or PDF) with auth header.
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
    throw new Error(`Report export request failed with status ${response.status} (${response.statusText})`);
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
 * Analytics & Executive Reporting API Service Module.
 * Communicates with backend /api/v1/analytics endpoints.
 */
export const analyticsApi = {
  /** GET /api/v1/analytics/overview */
  getOverview: (params?: AnalyticsQueryFilters): Promise<ApiResponse<AnalyticsOverviewData>> =>
    apiClient.get<ApiResponse<AnalyticsOverviewData>>('/analytics/overview', { params }),

  /** GET /api/v1/analytics/leads */
  getLeads: (params?: AnalyticsQueryFilters): Promise<ApiResponse<LeadAnalyticsData>> =>
    apiClient.get<ApiResponse<LeadAnalyticsData>>('/analytics/leads', { params }),

  /** GET /api/v1/analytics/financials */
  getFinancials: (params?: AnalyticsQueryFilters): Promise<ApiResponse<FinancialAnalyticsData>> =>
    apiClient.get<ApiResponse<FinancialAnalyticsData>>('/analytics/financials', { params }),

  /** GET /api/v1/analytics/tickets */
  getTickets: (params?: AnalyticsQueryFilters): Promise<ApiResponse<TicketAnalyticsData>> =>
    apiClient.get<ApiResponse<TicketAnalyticsData>>('/analytics/tickets', { params }),

  /** GET /api/v1/analytics/projects */
  getProjects: (params?: AnalyticsQueryFilters): Promise<ApiResponse<ProjectAnalyticsData>> =>
    apiClient.get<ApiResponse<ProjectAnalyticsData>>('/analytics/projects', { params }),

  /** GET /api/v1/analytics/pipelines */
  getPipelines: (params?: AnalyticsQueryFilters): Promise<ApiResponse<PipelineAnalyticsData>> =>
    apiClient.get<ApiResponse<PipelineAnalyticsData>>('/analytics/pipelines', { params }),

  /** GET /api/v1/analytics/leads/export (CSV Download) */
  exportLeadsCsv: async (params?: AnalyticsQueryFilters): Promise<void> => {
    const blob = await fetchBlob('/analytics/leads/export', params);
    triggerBlobDownload(blob, `leads_report_${Date.now()}.csv`);
  },

  /** GET /api/v1/analytics/invoices/export (CSV Download) */
  exportInvoicesCsv: async (params?: AnalyticsQueryFilters): Promise<void> => {
    const blob = await fetchBlob('/analytics/invoices/export', params);
    triggerBlobDownload(blob, `invoices_report_${Date.now()}.csv`);
  },

  /** GET /api/v1/analytics/tickets/export (CSV Download) */
  exportTicketsCsv: async (params?: AnalyticsQueryFilters): Promise<void> => {
    const blob = await fetchBlob('/analytics/tickets/export', params);
    triggerBlobDownload(blob, `tickets_report_${Date.now()}.csv`);
  },

  /** GET /api/v1/analytics/projects/export (CSV Download) */
  exportProjectsCsv: async (params?: AnalyticsQueryFilters): Promise<void> => {
    const blob = await fetchBlob('/analytics/projects/export', params);
    triggerBlobDownload(blob, `projects_report_${Date.now()}.csv`);
  },

  /** GET /api/v1/analytics/reports/pdf (PDF Executive Report Download) */
  exportReportPdf: async (params?: ReportExportQueryFilters): Promise<void> => {
    const reportType = params?.report || 'overview';
    const blob = await fetchBlob('/analytics/reports/pdf', params);
    triggerBlobDownload(blob, `executive_${reportType}_report_${Date.now()}.pdf`);
  },
};
