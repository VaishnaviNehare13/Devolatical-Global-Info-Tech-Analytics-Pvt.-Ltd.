import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { analyticsApi } from '../../api/analytics.api';
import type {
  AnalyticsOverviewData,
  LeadAnalyticsData,
  FinancialAnalyticsData,
  TicketAnalyticsData,
  ProjectAnalyticsData,
  PipelineAnalyticsData,
  AnalyticsQueryFilters,
} from '../../types/analytics';
import { ApiError } from '../../types/api';
import { formatCurrency } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Inbox,
  LifeBuoy,
  Briefcase,
  Database,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  AlertCircle,
  Calendar,
} from 'lucide-react';

type DomainTab = 'OVERVIEW' | 'FINANCIALS' | 'LEADS' | 'TICKETS' | 'PROJECTS' | 'PIPELINES';

export const AdminAnalytics: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<DomainTab>('OVERVIEW');

  // Filters State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Domain Analytics State
  const [overviewData, setOverviewData] = useState<AnalyticsOverviewData | null>(null);
  const [financialsData, setFinancialsData] = useState<FinancialAnalyticsData | null>(null);
  const [leadsData, setLeadsData] = useState<LeadAnalyticsData | null>(null);
  const [ticketsData, setTicketsData] = useState<TicketAnalyticsData | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectAnalyticsData | null>(null);
  const [pipelinesData, setPipelinesData] = useState<PipelineAnalyticsData | null>(null);

  // Status & Export States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exportingType, setExportingType] = useState<string | null>(null);

  // Derive filters object
  const getFilters = useCallback((): AnalyticsQueryFilters => {
    return {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }, [startDate, endDate]);

  // Fetch Domain Analytics Data
  const fetchAnalyticsData = useCallback(
    async (silent = false) => {
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);
      setLoadError(null);

      const filters = getFilters();

      try {
        if (activeTab === 'OVERVIEW') {
          const res = await analyticsApi.getOverview(filters);
          if (res?.data) setOverviewData(res.data);
        } else if (activeTab === 'FINANCIALS') {
          const res = await analyticsApi.getFinancials(filters);
          if (res?.data) setFinancialsData(res.data);
        } else if (activeTab === 'LEADS') {
          const res = await analyticsApi.getLeads(filters);
          if (res?.data) setLeadsData(res.data);
        } else if (activeTab === 'TICKETS') {
          const res = await analyticsApi.getTickets(filters);
          if (res?.data) setTicketsData(res.data);
        } else if (activeTab === 'PROJECTS') {
          const res = await analyticsApi.getProjects(filters);
          if (res?.data) setProjectsData(res.data);
        } else if (activeTab === 'PIPELINES') {
          const res = await analyticsApi.getPipelines(filters);
          if (res?.data) setPipelinesData(res.data);
        }
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to synchronize analytics intelligence metrics.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab, getFilters, showToast]
  );

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Date Filter Presets
  const applyPreset = (preset: 'LAST_30' | 'YTD' | 'CLEAR') => {
    if (preset === 'CLEAR') {
      setStartDate('');
      setEndDate('');
      return;
    }

    const now = new Date();
    const endStr = now.toISOString().split('T')[0];

    if (preset === 'LAST_30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
      setEndDate(endStr);
    } else if (preset === 'YTD') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(startOfYear.toISOString().split('T')[0]);
      setEndDate(endStr);
    }
  };

  // CSV Export Handlers
  const handleExportCsv = async (type: 'leads' | 'invoices' | 'tickets' | 'projects') => {
    setExportingType(`csv-${type}`);
    const filters = getFilters();
    try {
      if (type === 'leads') await analyticsApi.exportLeadsCsv(filters);
      else if (type === 'invoices') await analyticsApi.exportInvoicesCsv(filters);
      else if (type === 'tickets') await analyticsApi.exportTicketsCsv(filters);
      else if (type === 'projects') await analyticsApi.exportProjectsCsv(filters);

      showToast(`Successfully exported ${type} CSV report.`, 'success');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : `Failed to export ${type} CSV.`;
      showToast(message, 'error');
    } finally {
      setExportingType(null);
    }
  };

  // PDF Report Export Handler
  const handleExportPdf = async () => {
    setExportingType('pdf');
    const filters = getFilters();
    try {
      const reportType = activeTab.toLowerCase() as
        | 'overview'
        | 'leads'
        | 'financials'
        | 'tickets'
        | 'projects'
        | 'pipelines';

      await analyticsApi.exportReportPdf({ ...filters, report: reportType });
      showToast(`Successfully generated ${activeTab} executive PDF report.`, 'success');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to export PDF report.';
      showToast(message, 'error');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-secondary" />
            <h1 className="text-2xl font-bold tracking-tight">Executive Analytics & Intelligence</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              Live Data Engine
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Real-time business performance, financial ledger trends, support SLA metrics, and downloadable executive reports.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalyticsData(true)}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Metrics
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPdf}
            disabled={!!exportingType}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            {exportingType === 'pdf' ? 'Generating PDF...' : 'Download Executive PDF'}
          </Button>
        </div>
      </div>

      {/* Date Filter & Export Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Date Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Filter Range:</span>
            </div>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
            />

            {/* Presets */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
              <button
                type="button"
                onClick={() => applyPreset('LAST_30')}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[11px] font-mono cursor-pointer"
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset('YTD')}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[11px] font-mono cursor-pointer"
              >
                Year to Date
              </button>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => applyPreset('CLEAR')}
                  className="px-2 py-1 text-danger hover:underline text-[11px] font-semibold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Quick CSV Export Actions */}
          <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-4">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono mr-1">CSV Exports:</span>
            <button
              onClick={() => handleExportCsv('leads')}
              disabled={!!exportingType}
              className="p-1.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:border-secondary transition-colors text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
              title="Export Leads CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-amber-500" />
              <span>Leads</span>
            </button>
            <button
              onClick={() => handleExportCsv('invoices')}
              disabled={!!exportingType}
              className="p-1.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:border-secondary transition-colors text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
              title="Export Invoices CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>Invoices</span>
            </button>
            <button
              onClick={() => handleExportCsv('tickets')}
              disabled={!!exportingType}
              className="p-1.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:border-secondary transition-colors text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
              title="Export Tickets CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
              <span>Tickets</span>
            </button>
            <button
              onClick={() => handleExportCsv('projects')}
              disabled={!!exportingType}
              className="p-1.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:border-secondary transition-colors text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
              title="Export Projects CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-500" />
              <span>Projects</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Domain Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex space-x-6 overflow-x-auto">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
          { key: 'FINANCIALS', label: 'Financials & Invoicing', icon: CreditCard },
          { key: 'LEADS', label: 'Leads & Funnel', icon: Inbox },
          { key: 'TICKETS', label: 'Support Tickets & SLA', icon: LifeBuoy },
          { key: 'PROJECTS', label: 'Projects & Milestones', icon: Briefcase },
          { key: 'PIPELINES', label: 'Data Pipelines', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as DomainTab)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 transition-colors flex-shrink-0 ${
                isActive
                  ? 'border-b-2 border-secondary text-secondary'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Alert Box */}
      {loadError && (
        <Card className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Analytics Synchronization Error
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchAnalyticsData(false)}>
            Retry Loading
          </Button>
        </Card>
      )}

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {isLoading && !loadError ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-6 space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-3/4" />
                </Card>
              ))}
            </div>
          ) : overviewData ? (
            <>
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Invoiced Revenue
                    </span>
                    <CreditCard className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                      {formatCurrency(overviewData.summary.totalInvoicedAmount)}
                    </h3>
                    <p className="text-xs text-emerald-500 font-mono mt-1">
                      {formatCurrency(overviewData.summary.paidAmount)} Paid ({overviewData.summary.totalInvoices} Invoices)
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Lead Acquisition
                    </span>
                    <Inbox className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                      {overviewData.summary.totalLeads} Total Leads
                    </h3>
                    <p className="text-xs text-amber-500 font-mono mt-1">
                      {overviewData.summary.wonLeads} Converted to Clients ({overviewData.domains.leads.conversionRate}%)
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Support Desk SLA
                    </span>
                    <LifeBuoy className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                      {overviewData.summary.openTickets} Open Tickets
                    </h3>
                    <p className="text-xs text-blue-500 font-mono mt-1">
                      Resolution Rate: {overviewData.domains.tickets.resolutionRate}% ({overviewData.summary.totalTickets} Total)
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Delivery Workstreams
                    </span>
                    <Briefcase className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                      {overviewData.summary.activeProjects} Active
                    </h3>
                    <p className="text-xs text-indigo-500 font-mono mt-1">
                      {overviewData.summary.activePipelines} Pipelines • {overviewData.domains.projects.milestoneCompletionRate}% Milestones Done
                    </p>
                  </div>
                </Card>
              </div>

              {/* Domain Overview Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Domain Performance Ledger</CardTitle>
                  <CardDescription>Cross-domain operational health & volume telemetry.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-dark/40 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Domain</th>
                          <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Primary Volume</th>
                          <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Secondary Metric</th>
                          <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Health Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <Inbox className="h-4 w-4 text-amber-500" /> Leads & CRM
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{overviewData.summary.totalLeads} Total Submissions</td>
                          <td className="px-6 py-4 text-xs font-mono">{overviewData.summary.wonLeads} Converted Deals</td>
                          <td className="px-6 py-4"><Badge variant="success">Active</Badge></td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-500" /> Financials & Invoices
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{formatCurrency(overviewData.summary.paidAmount)} Paid Revenue</td>
                          <td className="px-6 py-4 text-xs font-mono">{formatCurrency(overviewData.domains.financials.pendingAmount)} Pending Balance</td>
                          <td className="px-6 py-4"><Badge variant="success">Optimal</Badge></td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <LifeBuoy className="h-4 w-4 text-blue-500" /> Support Desk SLA
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{overviewData.summary.openTickets} Open Tickets</td>
                          <td className="px-6 py-4 text-xs font-mono">{overviewData.domains.tickets.resolutionRate}% Resolution Rate</td>
                          <td className="px-6 py-4"><Badge variant="secondary">Operational</Badge></td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-indigo-500" /> Projects & Engagements
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{overviewData.summary.activeProjects} Active Projects</td>
                          <td className="px-6 py-4 text-xs font-mono">{overviewData.domains.projects.milestoneCompletionRate}% Milestones Completed</td>
                          <td className="px-6 py-4"><Badge variant="success">On Schedule</Badge></td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <Database className="h-4 w-4 text-purple-500" /> Data Pipelines
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{overviewData.summary.activePipelines} Active Streams</td>
                          <td className="px-6 py-4 text-xs font-mono">{overviewData.domains.pipelines.averageProgress}% Average Progress</td>
                          <td className="px-6 py-4"><Badge variant="success">Healthy</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400">No overview analytics data available.</Card>
          )}
        </div>
      )}

      {/* Tab 2: FINANCIALS */}
      {activeTab === 'FINANCIALS' && (
        <div className="space-y-6">
          {isLoading && !loadError ? (
            <Skeleton className="h-64 w-full" />
          ) : financialsData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Invoiced</span>
                  <h3 className="text-2xl font-bold font-heading mt-2">{formatCurrency(financialsData.totalInvoicedAmount)}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{financialsData.totalInvoices} Invoices Total</p>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-emerald-500 uppercase">Paid Volume</span>
                  <h3 className="text-2xl font-bold font-heading text-emerald-500 mt-2">{formatCurrency(financialsData.paidAmount)}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Cleared Transactions</p>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-amber-500 uppercase">Pending Ledger</span>
                  <h3 className="text-2xl font-bold font-heading text-amber-500 mt-2">{formatCurrency(financialsData.pendingAmount)}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Awaiting Client Payment</p>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-danger uppercase">Overdue Balance</span>
                  <h3 className="text-2xl font-bold font-heading text-danger mt-2">{formatCurrency(financialsData.overdueAmount)}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Passed Due Date</p>
                </Card>
              </div>

              {/* Invoice Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoices Status Breakdown</CardTitle>
                  <CardDescription>Aggregate invoice count and value breakdown by status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(financialsData.invoicesByStatus || {}).map(([st, metric]) => (
                      <div key={st} className="p-4 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono uppercase text-slate-700 dark:text-slate-300">{st}</span>
                          <Badge variant={st === 'PAID' ? 'success' : st === 'PENDING' ? 'warning' : 'danger'}>{metric.count} Invoices</Badge>
                        </div>
                        <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{formatCurrency(metric.totalAmount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400">No financial analytics data available.</Card>
          )}
        </div>
      )}

      {/* Tab 3: LEADS */}
      {activeTab === 'LEADS' && (
        <div className="space-y-6">
          {isLoading && !loadError ? (
            <Skeleton className="h-64 w-full" />
          ) : leadsData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Submissions</span>
                  <h3 className="text-2xl font-bold font-heading mt-2">{leadsData.totalLeads} Leads</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-emerald-500 uppercase">Converted (WON)</span>
                  <h3 className="text-2xl font-bold font-heading text-emerald-500 mt-2">{leadsData.wonLeads} Won</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-secondary uppercase">Conversion Rate</span>
                  <h3 className="text-2xl font-bold font-heading text-secondary mt-2">{leadsData.conversionRate}%</h3>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Leads by Status</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(leadsData.leadsByStatus || {}).map(([st, count]) => (
                      <div key={st} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold">{st}</span>
                          <span>{count} leads ({leadsData.totalLeads > 0 ? Math.round((count / leadsData.totalLeads) * 100) : 0}%)</span>
                        </div>
                        <ProgressBar value={leadsData.totalLeads > 0 ? (count / leadsData.totalLeads) * 100 : 0} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Leads by Acquisition Source</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(leadsData.leadsBySource || {}).map(([src, count]) => (
                      <div key={src} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold">{src}</span>
                          <span>{count} leads</span>
                        </div>
                        <ProgressBar value={leadsData.totalLeads > 0 ? (count / leadsData.totalLeads) * 100 : 0} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400">No lead analytics data available.</Card>
          )}
        </div>
      )}

      {/* Tab 4: TICKETS */}
      {activeTab === 'TICKETS' && (
        <div className="space-y-6">
          {isLoading && !loadError ? (
            <Skeleton className="h-64 w-full" />
          ) : ticketsData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Tickets</span>
                  <h3 className="text-2xl font-bold font-heading mt-2">{ticketsData.totalTickets}</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-amber-500 uppercase">Open / Pending</span>
                  <h3 className="text-2xl font-bold font-heading text-amber-500 mt-2">{ticketsData.openTickets}</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-emerald-500 uppercase">Resolved & Closed</span>
                  <h3 className="text-2xl font-bold font-heading text-emerald-500 mt-2">{ticketsData.resolvedTickets + ticketsData.closedTickets}</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-secondary uppercase">SLA Resolution Rate</span>
                  <h3 className="text-2xl font-bold font-heading text-secondary mt-2">{ticketsData.resolutionRate}%</h3>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Tickets by Priority</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(ticketsData.ticketsByPriority || {}).map(([prio, count]) => (
                      <div key={prio} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold">{prio}</span>
                          <span>{count} tickets</span>
                        </div>
                        <ProgressBar value={ticketsData.totalTickets > 0 ? (count / ticketsData.totalTickets) * 100 : 0} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Tickets by Status</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(ticketsData.ticketsByStatus || {}).map(([st, count]) => (
                      <div key={st} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold">{st}</span>
                          <span>{count} tickets</span>
                        </div>
                        <ProgressBar value={ticketsData.totalTickets > 0 ? (count / ticketsData.totalTickets) * 100 : 0} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400">No support ticket analytics data available.</Card>
          )}
        </div>
      )}

      {/* Tab 5: PROJECTS */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-6">
          {isLoading && !loadError ? (
            <Skeleton className="h-64 w-full" />
          ) : projectsData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Projects</span>
                  <h3 className="text-2xl font-bold font-heading mt-2">{projectsData.totalProjects}</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-emerald-500 uppercase">Active Projects</span>
                  <h3 className="text-2xl font-bold font-heading text-emerald-500 mt-2">{projectsData.activeProjects}</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-indigo-500 uppercase">Total Milestones</span>
                  <h3 className="text-2xl font-bold font-heading text-indigo-500 mt-2">{projectsData.totalMilestones}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{projectsData.completedMilestones} Completed</p>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-secondary uppercase">Milestone Completion</span>
                  <h3 className="text-2xl font-bold font-heading text-secondary mt-2">{projectsData.milestoneCompletionRate}%</h3>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Projects Status Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(projectsData.projectsByStatus || {}).map(([st, count]) => (
                    <div key={st} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-bold">{st}</span>
                        <span>{count} projects</span>
                      </div>
                      <ProgressBar value={projectsData.totalProjects > 0 ? (count / projectsData.totalProjects) * 100 : 0} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400">No project analytics data available.</Card>
          )}
        </div>
      )}

      {/* Tab 6: PIPELINES */}
      {activeTab === 'PIPELINES' && (
        <div className="space-y-6">
          {isLoading && !loadError ? (
            <Skeleton className="h-64 w-full" />
          ) : pipelinesData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Pipelines</span>
                  <h3 className="text-2xl font-bold font-heading mt-2">{pipelinesData.totalPipelines}</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-emerald-500 uppercase">Active / Syncing</span>
                  <h3 className="text-2xl font-bold font-heading text-emerald-500 mt-2">{pipelinesData.activePipelines + pipelinesData.syncingPipelines}</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-danger uppercase">Failed Streams</span>
                  <h3 className="text-2xl font-bold font-heading text-danger mt-2">{pipelinesData.failedPipelines}</h3>
                </Card>
                <Card>
                  <span className="text-xs font-semibold text-secondary uppercase">Average Progress</span>
                  <h3 className="text-2xl font-bold font-heading text-secondary mt-2">{pipelinesData.averageProgress}%</h3>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Data Pipeline Status Overview</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50">
                    <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase block">ACTIVE</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{pipelinesData.activePipelines}</span>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50">
                    <span className="text-[10px] text-blue-600 font-mono font-bold uppercase block">SYNCING</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{pipelinesData.syncingPipelines}</span>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50">
                    <span className="text-[10px] text-amber-600 font-mono font-bold uppercase block">STOPPED</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{pipelinesData.stoppedPipelines}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">COMPLETED</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{pipelinesData.completedPipelines}</span>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200/50">
                    <span className="text-[10px] text-danger font-mono font-bold uppercase block">FAILED</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{pipelinesData.failedPipelines}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400">No pipeline analytics data available.</Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
