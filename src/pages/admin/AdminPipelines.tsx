import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { systemMetricsApi } from '../../api/system-metrics.api';
import type { SystemMetricsPayload } from '../../api/system-metrics.api';
import { Play, Square, Database, Server, Activity, CheckSquare } from 'lucide-react';

interface PipelineRecord {
  id: string;
  name: string;
  source: string;
  target: string;
  volume: string;
  status: 'Active' | 'Stopped' | 'Syncing';
}

export const AdminPipelines: React.FC = () => {
  const { showToast } = useToast();

  const [metrics, setMetrics] = useState<SystemMetricsPayload | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);

  const [pipelines, setPipelines] = useState<PipelineRecord[]>([
    { id: 'P-101', name: 'financial-transaction-stream', source: 'Kinesis Kafka', target: 'Snowflake Core', volume: '1.2M req/hr', status: 'Active' },
    { id: 'P-102', name: 'healthcare-telemetry-ingest', source: 'Azure IoT Hub', target: 'Databricks Lakehouse', volume: '800k req/hr', status: 'Active' },
    { id: 'P-103', name: 'retail-clickstream-collector', source: 'Web Telemetry SDK', target: 'MongoDB Atlas', volume: '3.4M req/hr', status: 'Syncing' },
    { id: 'P-104', name: 'logistics-gps-tracking-sync', source: 'GPS Ingest API', target: 'PostgreSQL Spatial', volume: '120k req/hr', status: 'Stopped' },
  ]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingMetrics(true);
    systemMetricsApi
      .getSystemMetrics()
      .then((res) => {
        if (isMounted && res?.data) {
          setMetrics(res.data);
        }
      })
      .catch(() => {
        // Silently preserve offline/null metrics presentation fallback
      })
      .finally(() => {
        if (isMounted) setIsLoadingMetrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Stopped' : 'Active';
    setPipelines((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );
    showToast(`Pipeline ${id} status shifted to ${nextStatus}.`, 'info');
  };

  const columns = [
    { key: 'id' as keyof PipelineRecord, header: 'ID' },
    { key: 'name' as keyof PipelineRecord, header: 'Pipeline Name' },
    { key: 'source' as keyof PipelineRecord, header: 'Data Source' },
    { key: 'target' as keyof PipelineRecord, header: 'Data Target' },
    { key: 'volume' as keyof PipelineRecord, header: 'Throughput Spec' },
    {
      key: 'status' as keyof PipelineRecord,
      header: 'Status',
      render: (row: PipelineRecord) => {
        const variants = {
          Active: 'success' as const,
          Syncing: 'secondary' as const,
          Stopped: 'outline' as const,
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      },
    },
    {
      key: 'id' as keyof PipelineRecord,
      header: 'Actions',
      render: (row: PipelineRecord) => (
        <button
          onClick={() => toggleStatus(row.id, row.status)}
          className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          title={row.status === 'Active' ? 'Stop Stream' : 'Start Stream'}
        >
          {row.status === 'Active' ? <Square className="h-3 w-3 text-red-500" /> : <Play className="h-3 w-3 text-green-500" />}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Data Pipelines & Ingestion</h1>
          <Badge variant="secondary" className="font-mono text-xs">
            Architecture Preview
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          Streaming ingestion specifications, ETL targets, and real-time backend telemetry summary.
        </p>
      </div>

      {/* Real System Telemetry Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase font-mono">
            <Server className="h-4 w-4 text-secondary" />
            <span>Database Node</span>
          </div>
          {isLoadingMetrics ? (
            <Skeleton className="h-6 w-24 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white uppercase block">
                {metrics?.system.database || 'Connected'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                Env: {metrics?.system.environment || 'development'}
              </span>
            </div>
          )}
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase font-mono">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>Backend Uptime</span>
          </div>
          {isLoadingMetrics ? (
            <Skeleton className="h-6 w-24 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white block">
                {metrics?.system.uptimeFormatted || 'Active'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                Node.js HTTP Server Process
              </span>
            </div>
          )}
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase font-mono">
            <CheckSquare className="h-4 w-4 text-accent" />
            <span>Workstream Metrics</span>
          </div>
          {isLoadingMetrics ? (
            <Skeleton className="h-6 w-24 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white block">
                {metrics?.metrics.projects.active ?? 0} Active Workstreams
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {metrics?.metrics.tasks.active ?? 0} Tasks • {metrics?.metrics.auditLogs.total ?? 0} Audit Events
              </span>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-accent mb-1">
            <Database className="h-5 w-5" />
            <CardTitle>Global ETL & Ingestion Pipelines</CardTitle>
          </div>
          <CardDescription>Target definitions, stream protocols, and architectural specifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={pipelines} searchKey="name" rowsPerPage={5} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPipelines;
