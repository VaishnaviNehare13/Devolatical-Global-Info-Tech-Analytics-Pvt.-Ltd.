export interface AnalyticsQueryFilters extends Record<string, unknown> {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  projectId?: string;
  status?: string;
  source?: string;
}

export interface ReportExportQueryFilters extends AnalyticsQueryFilters {
  report?: 'overview' | 'leads' | 'financials' | 'tickets' | 'projects' | 'pipelines';
}

export interface LeadAnalyticsData {
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
}

export interface InvoiceStatusMetric {
  count: number;
  totalAmount: number;
}

export interface FinancialAnalyticsData {
  totalInvoices: number;
  totalInvoicedAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  invoicesByStatus: Record<string, InvoiceStatusMetric>;
}

export interface TicketAnalyticsData {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  resolutionRate: number;
  ticketsByPriority: Record<string, number>;
  ticketsByStatus: Record<string, number>;
}

export interface ProjectAnalyticsData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectsByStatus: Record<string, number>;
  totalMilestones: number;
  completedMilestones: number;
  milestoneCompletionRate: number;
}

export interface PipelineAnalyticsData {
  totalPipelines: number;
  activePipelines: number;
  syncingPipelines: number;
  stoppedPipelines: number;
  completedPipelines: number;
  failedPipelines: number;
  averageProgress: number;
}

export interface AnalyticsOverviewSummary {
  totalLeads: number;
  wonLeads: number;
  totalInvoices: number;
  totalInvoicedAmount: number;
  paidAmount: number;
  openTickets: number;
  totalTickets: number;
  activeProjects: number;
  totalProjects: number;
  activePipelines: number;
  totalPipelines: number;
}

export interface AnalyticsOverviewData {
  timestamp: string;
  summary: AnalyticsOverviewSummary;
  domains: {
    leads: LeadAnalyticsData;
    financials: FinancialAnalyticsData;
    tickets: TicketAnalyticsData;
    projects: ProjectAnalyticsData;
    pipelines: PipelineAnalyticsData;
  };
}
