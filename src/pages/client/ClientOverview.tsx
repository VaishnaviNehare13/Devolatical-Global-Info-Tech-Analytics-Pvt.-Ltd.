import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { clientPortalApi, type ClientOverviewData } from '../../api/client-portal.api';
import { formatCurrency } from '../../utils/formatters';
import { Database, Activity, CheckCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';

export const ClientOverview: React.FC = () => {
  const [data, setData] = useState<ClientOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientPortalApi.getOverview();
      if (res.data) {
        setData(res.data);
      }
    } catch {
      setError('Failed to fetch telemetry metrics from Client Portal API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Client Portal Workspace</h1>
          <p className="text-sm text-slate-500">
            Overview of your active data pipelines, cloud deployments, and project deliverables.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOverview} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-amber-800 dark:text-amber-200 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchOverview}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">System Status</span>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <h3 className="text-2xl font-bold">{data?.systemStatus || 'Optimal'}</h3>
            )}
            <p className="text-xs text-green-500 mt-1">✓ Core ingestion pipelines operational</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Data Ingested</span>
            <Database className="h-5 w-5 text-secondary" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <h3 className="text-2xl font-bold">{data?.dataVolume || 'High Volume'}</h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Processed in active window</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Projects</span>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <h3 className="text-2xl font-bold">{data?.activeProjectsCount ?? 0} Active</h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Assigned enterprise workstreams</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Invoices</span>
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <h3 className="text-2xl font-bold">
                {formatCurrency(data?.pendingInvoiceTotal)}
              </h3>
            )}
            <p className="text-xs text-green-500 mt-1">✓ Account ledger active</p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Pipelines and Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Pipelines */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Active Data Ingestion Pipelines</CardTitle>
            <CardDescription>Real-time telemetry tracking active ETL data syncs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              : (data?.activePipelines || []).map((pip) => (
                  <div key={pip.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{pip.name}</span>
                      <Badge variant={pip.status === 'Active' ? 'success' : 'warning'}>{pip.status}</Badge>
                    </div>
                    <ProgressBar value={pip.progress} />
                  </div>
                ))}
          </CardContent>
        </Card>

        {/* Project Health / Deliverables */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Project Milestones</CardTitle>
            <CardDescription>Active delivery objectives status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              : (data?.projectMilestones || []).map((ms) => (
                  <div key={ms.id} className="flex items-start justify-between border-b border-slate-50 dark:border-slate-800/40 pb-3.5">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ms.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{ms.description}</p>
                    </div>
                    <Badge variant={ms.status === 'Completed' ? 'success' : ms.status === 'In Progress' ? 'secondary' : 'outline'}>
                      {ms.status}
                    </Badge>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default ClientOverview;
