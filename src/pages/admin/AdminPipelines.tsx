import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import { Play, Square } from 'lucide-react';

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
  
  const [pipelines, setPipelines] = useState<PipelineRecord[]>([
    { id: 'P-101', name: 'financial-transaction-stream', source: 'Kinesis Kafka', target: 'Snowflake Core', volume: '1.2M req/hr', status: 'Active' },
    { id: 'P-102', name: 'healthcare-telemetry-ingest', source: 'Azure IoT Hub', target: 'Databricks Lakehouse', volume: '800k req/hr', status: 'Active' },
    { id: 'P-103', name: 'retail-clickstream-collector', source: 'Web Telemetry SDK', target: 'MongoDB Atlas', volume: '3.4M req/hr', status: 'Syncing' },
    { id: 'P-104', name: 'logistics-gps-tracking-sync', source: 'GPS Ingest API', target: 'PostgreSQL Spatial', volume: '120k req/hr', status: 'Stopped' }
  ]);

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
    { key: 'volume' as keyof PipelineRecord, header: 'Throughput' },
    {
      key: 'status' as keyof PipelineRecord,
      header: 'Status',
      render: (row: PipelineRecord) => {
        const variants = {
          Active: 'success' as const,
          Syncing: 'secondary' as const,
          Stopped: 'outline' as const
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    },
    {
      key: 'id' as keyof PipelineRecord,
      header: 'Actions',
      render: (row: PipelineRecord) => (
        <button
          onClick={() => toggleStatus(row.id, row.status)}
          className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
        >
          {row.status === 'Active' ? <Square className="h-3 w-3 text-red-500" /> : <Play className="h-3 w-3 text-green-500" />}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Data Pipelines</h1>
        <p className="text-sm text-slate-500">
          Manage streaming configurations, Kafka endpoints, and Redshift target loads.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global ETL & Ingestion Pipelines</CardTitle>
          <CardDescription>Verify connection states, telemetry volumes, and target databases.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={pipelines} searchKey="name" rowsPerPage={5} />
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminPipelines;
