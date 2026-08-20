import { AnalyticsRepository } from '../repositories/analytics.repository';
import { AnalyticsQueryInput } from '../dto/analytics.dto';
import { generateCsv } from '../utils/csv.generator';
import { generateReportPdf, ReportPdfData } from '../utils/report-pdf.generator';

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  public async getOverview(filters: AnalyticsQueryInput) {
    const [leads, financials, tickets, projects, pipelines] = await Promise.all([
      this.analyticsRepository.getLeadAnalytics(filters),
      this.analyticsRepository.getFinancialAnalytics(filters),
      this.analyticsRepository.getTicketAnalytics(filters),
      this.analyticsRepository.getProjectAnalytics(filters),
      this.analyticsRepository.getPipelineAnalytics(filters),
    ]);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalLeads: leads.totalLeads,
        wonLeads: leads.wonLeads,
        totalInvoices: financials.totalInvoices,
        totalInvoicedAmount: financials.totalInvoicedAmount,
        paidAmount: financials.paidAmount,
        openTickets: tickets.openTickets,
        totalTickets: tickets.totalTickets,
        activeProjects: projects.activeProjects,
        totalProjects: projects.totalProjects,
        activePipelines: pipelines.activePipelines,
        totalPipelines: pipelines.totalPipelines,
      },
      domains: {
        leads,
        financials,
        tickets,
        projects,
        pipelines,
      },
    };
  }

  public async getLeadAnalytics(filters: AnalyticsQueryInput) {
    return this.analyticsRepository.getLeadAnalytics(filters);
  }

  public async getFinancialAnalytics(filters: AnalyticsQueryInput) {
    return this.analyticsRepository.getFinancialAnalytics(filters);
  }

  public async getTicketAnalytics(filters: AnalyticsQueryInput) {
    return this.analyticsRepository.getTicketAnalytics(filters);
  }

  public async getProjectAnalytics(filters: AnalyticsQueryInput) {
    return this.analyticsRepository.getProjectAnalytics(filters);
  }

  public async getPipelineAnalytics(filters: AnalyticsQueryInput) {
    return this.analyticsRepository.getPipelineAnalytics(filters);
  }

  // CSV Export Generators
  public async exportLeadsCsv(filters: AnalyticsQueryInput): Promise<{ filename: string; csvString: string }> {
    const leads = await this.analyticsRepository.getRawLeadsForExport(filters);
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Lead Name' },
      { key: 'email', header: 'Email' },
      { key: 'companyName', header: 'Company' },
      { key: 'status', header: 'Status' },
      { key: 'source', header: 'Source' },
      { key: 'estimatedBudget', header: 'Estimated Budget' },
      { key: 'createdAt', header: 'Created Date', getValue: (row: any) => new Date(row.createdAt).toISOString() },
    ];

    const csvString = generateCsv(columns, leads);
    const filename = `leads_report_${Date.now()}.csv`;
    return { filename, csvString };
  }

  public async exportInvoicesCsv(filters: AnalyticsQueryInput): Promise<{ filename: string; csvString: string }> {
    const invoices = await this.analyticsRepository.getRawInvoicesForExport(filters);
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'invoiceNumber', header: 'Invoice Number' },
      { key: 'client', header: 'Client', getValue: (row: any) => row.client?.name || 'N/A' },
      { key: 'project', header: 'Project', getValue: (row: any) => row.project?.name || 'N/A' },
      { key: 'amount', header: 'Amount' },
      { key: 'currency', header: 'Currency' },
      { key: 'status', header: 'Status' },
      { key: 'dueDate', header: 'Due Date', getValue: (row: any) => (row.dueDate ? new Date(row.dueDate).toISOString() : 'N/A') },
      { key: 'createdAt', header: 'Created Date', getValue: (row: any) => new Date(row.createdAt).toISOString() },
    ];

    const csvString = generateCsv(columns, invoices);
    const filename = `invoices_report_${Date.now()}.csv`;
    return { filename, csvString };
  }

  public async exportTicketsCsv(filters: AnalyticsQueryInput): Promise<{ filename: string; csvString: string }> {
    const tickets = await this.analyticsRepository.getRawTicketsForExport(filters);
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'subject', header: 'Subject' },
      { key: 'client', header: 'Client', getValue: (row: any) => row.client?.name || 'N/A' },
      { key: 'project', header: 'Project', getValue: (row: any) => row.project?.name || 'N/A' },
      { key: 'priority', header: 'Priority' },
      { key: 'status', header: 'Status' },
      { key: 'createdAt', header: 'Created Date', getValue: (row: any) => new Date(row.createdAt).toISOString() },
    ];

    const csvString = generateCsv(columns, tickets);
    const filename = `tickets_report_${Date.now()}.csv`;
    return { filename, csvString };
  }

  public async exportProjectsCsv(filters: AnalyticsQueryInput): Promise<{ filename: string; csvString: string }> {
    const projects = await this.analyticsRepository.getRawProjectsForExport(filters);
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Project Name' },
      { key: 'code', header: 'Code' },
      { key: 'client', header: 'Client', getValue: (row: any) => row.client?.name || 'N/A' },
      { key: 'status', header: 'Status' },
      { key: 'milestoneCount', header: 'Milestones', getValue: (row: any) => row.milestones?.length || 0 },
      { key: 'createdAt', header: 'Created Date', getValue: (row: any) => new Date(row.createdAt).toISOString() },
    ];

    const csvString = generateCsv(columns, projects);
    const filename = `projects_report_${Date.now()}.csv`;
    return { filename, csvString };
  }

  // PDF Report Generator
  public async exportReportPdf(reportType: string, filters: AnalyticsQueryInput): Promise<{ filename: string; pdfBuffer: Buffer }> {
    const generatedAt = new Date();

    if (reportType === 'financials' || reportType === 'invoices') {
      const fin = await this.analyticsRepository.getFinancialAnalytics(filters);
      const pdfData: ReportPdfData = {
        reportTitle: 'Financial & Invoice Intelligence',
        subtitle: 'Executive Revenue, Ledger, and Invoicing Analytics',
        generatedAt,
        filtersSummary: filters.clientId ? `Client Organization ID: ${filters.clientId}` : 'All Accounts',
        kpis: [
          { label: 'Total Invoices', value: fin.totalInvoices },
          { label: 'Total Invoiced', value: `$${fin.totalInvoicedAmount.toLocaleString()}` },
          { label: 'Paid Revenue', value: `$${fin.paidAmount.toLocaleString()}` },
          { label: 'Pending Ledger', value: `$${fin.pendingAmount.toLocaleString()}` },
        ],
        tableHeaders: ['Status', 'Invoice Count', 'Total Value'],
        tableRows: Object.entries(fin.invoicesByStatus).map(([status, item]) => [
          status,
          item.count,
          `$${item.totalAmount.toLocaleString()}`,
        ]),
      };
      const pdfBuffer = await generateReportPdf(pdfData);
      return { filename: `financial_report_${Date.now()}.pdf`, pdfBuffer };
    }

    // Default Overview Executive Report
    const overview = await this.getOverview(filters);
    const pdfData: ReportPdfData = {
      reportTitle: 'Enterprise Executive Overview',
      subtitle: 'Comprehensive Domain Analytics & System Intelligence Summary',
      generatedAt,
      filtersSummary: 'Global System Metrics',
      kpis: [
        { label: 'Total Leads', value: overview.summary.totalLeads },
        { label: 'Invoiced Value', value: `$${overview.summary.totalInvoicedAmount.toLocaleString()}` },
        { label: 'Open Tickets', value: overview.summary.openTickets },
        { label: 'Active Projects', value: overview.summary.activeProjects },
      ],
      tableHeaders: ['Domain', 'Primary Metric', 'Secondary Metric', 'Health Status'],
      tableRows: [
        ['CRM Leads', `${overview.summary.totalLeads} Total`, `${overview.summary.wonLeads} Won`, 'Operational'],
        ['Financials', `$${overview.summary.paidAmount.toLocaleString()} Paid`, `$${overview.domains.financials.pendingAmount.toLocaleString()} Pending`, 'Optimal'],
        ['Support Desk', `${overview.summary.openTickets} Open`, `${overview.summary.totalTickets} Total`, 'Active'],
        ['Projects', `${overview.summary.activeProjects} Active`, `${overview.summary.totalProjects} Total`, 'On Schedule'],
        ['Data Pipelines', `${overview.summary.activePipelines} Active`, `${overview.summary.totalPipelines} Total`, 'Healthy'],
      ],
    };

    const pdfBuffer = await generateReportPdf(pdfData);
    return { filename: `executive_overview_${Date.now()}.pdf`, pdfBuffer };
  }
}
