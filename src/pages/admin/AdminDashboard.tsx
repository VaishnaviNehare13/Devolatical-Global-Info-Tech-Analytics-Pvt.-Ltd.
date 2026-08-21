import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { systemMetricsApi } from '../../api/system-metrics.api';
import type { SystemMetricsPayload } from '../../api/system-metrics.api';
import { auditApi } from '../../api/audit.api';
import type { AuditLog } from '../../types/audit';
import { ApiError } from '../../types/api';

import {
  Activity,
  ShieldCheck,
  Users,
  Briefcase,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Server,
  Clock,
  CheckSquare,
  FileText,
  CreditCard,
  Building2,
  LifeBuoy,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();

  // Metrics & Activity state
  const [metricsData, setMetricsData] = useState<SystemMetricsPayload | null>(null);
  const [recentActivities, setRecentActivities] = useState<AuditLog[]>([]);

  // Page status states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const [metricsRes, auditRes] = await Promise.allSettled([
          systemMetricsApi.getSystemMetrics(),
          auditApi.getAuditLogs({ page: 1, limit: 5 }),
        ]);

        // System metrics parsing
        if (metricsRes.status === 'fulfilled' && metricsRes.value?.data) {
          setMetricsData(metricsRes.value.data);
        } else {
          setMetricsData(null);
          if (metricsRes.status === 'rejected') {
            throw metricsRes.reason;
          }
        }

        // Audit Logs parsing
        if (auditRes.status === 'fulfilled' && auditRes.value?.data) {
          setRecentActivities(auditRes.value.data.items || []);
        }
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to synchronize system telemetry metrics.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const isSystemHealthy = Boolean(
    metricsData &&
      metricsData.system.status === 'UP' &&
      metricsData.system.database === 'connected'
  );

  const statusBadgeVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'OK':
      case 'UP':
        return 'success';
      case 'DENIED':
      case 'FAILED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title & Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Ops Center Overview</h1>
            <Badge variant={isSystemHealthy ? 'success' : 'warning'} className="font-mono text-xs">
              {isSystemHealthy ? 'System Operational' : 'Telemetry Syncing'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Real-time global system metrics, health status, and live administrative audit log events.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboardData(true)}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </Button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: System Health */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System Health
            </span>
            <Activity className="h-5 w-5 text-secondary" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {isSystemHealthy ? 'Operational' : 'Degraded'}
                </h3>
                <p className="text-xs text-emerald-500 font-mono mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  DB {metricsData?.system.database || 'connected'} ({metricsData?.system.uptimeFormatted || 'active'})
                </p>
              </>
            )}
          </div>
        </Card>

        {/* KPI 2: User Directory Accounts */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enterprise Users
            </span>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {metricsData?.metrics.users.total ?? 0} Accounts
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {metricsData?.metrics.users.active ?? 0} active directory profiles
                </p>
              </>
            )}
          </div>
        </Card>

        {/* KPI 3: Audit Log Events */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System Audit Logs
            </span>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {metricsData?.metrics.auditLogs.total ?? 0} Events
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Immutable security audit trail
                </p>
              </>
            )}
          </div>
        </Card>

        {/* KPI 4: Active Projects */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Projects
            </span>
            <Briefcase className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {metricsData?.metrics.projects.active ?? 0} Active
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Out of {metricsData?.metrics.projects.total ?? 0} total workstreams
                </p>
              </>
            )}
          </div>
        </Card>

        {/* KPI 5: Support Desk Tickets */}
        <Card className="hover:border-secondary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/tickets'}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Support Desk Tickets
            </span>
            <LifeBuoy className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {metricsData?.metrics.tickets.open ?? 0} Open
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center justify-between">
                  <span>{metricsData?.metrics.tickets.total ?? 0} Total Tickets</span>
                  <span className="text-secondary font-semibold hover:underline flex items-center gap-0.5">
                    Manage <ArrowRight className="h-3 w-3 inline" />
                  </span>
                </p>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Error Alert Box */}
      {loadError && (
        <Card className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Telemetry Synchronization Alert
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchDashboardData(false)}>
            Retry Operational Sync
          </Button>
        </Card>
      )}

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workstream & System Telemetry Panel */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>System Infrastructure & Workstreams</CardTitle>
            <CardDescription>
              Live overview of database status, active projects, tasks, invoices, and documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
                    <Server className="h-4 w-4 text-secondary" />
                    <span>Database Cluster</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block uppercase">
                    {metricsData?.system.database || 'Connected'}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Env: {metricsData?.system.environment || 'development'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>Server Uptime</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                    {metricsData?.system.uptimeFormatted || 'Active'}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Node HTTP Process Uptime
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    <span>Workstream Tasks</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                    {metricsData?.metrics.tasks.active ?? 0} Active Tasks
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {metricsData?.metrics.tasks.completed ?? 0} Completed ({metricsData?.metrics.tasks.total ?? 0} Total)
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
                    <CreditCard className="h-4 w-4 text-indigo-500" />
                    <span>Invoices Engine</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                    {metricsData?.metrics.invoices.total ?? 0} Invoices
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {metricsData?.metrics.invoices.pending ?? 0} Pending • {metricsData?.metrics.invoices.paid ?? 0} Paid
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Document Vault</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                    {metricsData?.metrics.documents.total ?? 0} Files
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Enterprise Repository Vault
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    <span>Client Organizations</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                    {metricsData?.metrics.clients.total ?? 0} Clients
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Tenant Isolated Accounts
                  </span>
                </div>

                <Link
                  to="/admin/tickets"
                  className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 rounded-xl space-y-1.5 hover:border-amber-400 transition-colors block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">
                      <LifeBuoy className="h-4 w-4 text-amber-500" />
                      <span>Support Desk Console</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                    {metricsData?.metrics.tickets.open ?? 0} Open ({metricsData?.metrics.tickets.total ?? 0} Total)
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Manage Support Resolutions
                  </span>
                </Link>
              </div>
            )}

            {/* Performance Benchmark Bar */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent animate-pulse" />
                <span>System Uptime: {metricsData?.system.uptimeFormatted || '0s'} ({metricsData?.system.environment || 'development'} env)</span>
              </div>
              <Badge variant="success" className="text-[9px]">
                RBAC Protected
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Live System Activity Feed */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Live administrative audit log events.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 bg-slate-50 dark:bg-dark/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[8px] font-mono uppercase">
                        {act.module}
                      </Badge>
                      <h4 className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                        {act.action}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {act.user?.email || act.userId || 'System'} • {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(act.status)} className="text-[9px]">
                    {act.status || 'OK'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-1">
                <Terminal className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No recent audit log events</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/admin/audit"
                className="text-xs font-semibold text-secondary hover:underline flex items-center justify-between w-full p-1 cursor-pointer"
              >
                <span>View Full Audit Log Ledger</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
