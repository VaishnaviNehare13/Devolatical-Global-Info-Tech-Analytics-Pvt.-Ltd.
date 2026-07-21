import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Database, Activity, CheckCircle, Clock } from 'lucide-react';

export const ClientOverview: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Client Portal Workspace</h1>
        <p className="text-sm text-slate-500">
          Overview of your active data pipelines, cloud deployments, and project deliverables.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">System Status</span>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">Optimal</h3>
            <p className="text-xs text-green-500 mt-1">✓ Core ingestion pipelines operational</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Data Ingested</span>
            <Database className="h-5 w-5 text-secondary" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">High Volume</h3>
            <p className="text-xs text-slate-400 mt-1">Processed in active window</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Projects</span>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">3 Boards</h3>
            <p className="text-xs text-slate-400 mt-1">2 in dev, 1 in validation</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Invoices</span>
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">$0.00</h3>
            <p className="text-xs text-green-500 mt-1">✓ All accounts paid up to date</p>
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
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>healthcare-telemetry-ingest</span>
                <Badge variant="success">Active</Badge>
              </div>
              <ProgressBar value={85} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>financial-ledger-sync</span>
                <Badge variant="success">Active</Badge>
              </div>
              <ProgressBar value={94} color="bg-accent" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>retail-recommender-update</span>
                <Badge variant="warning">Syncing</Badge>
              </div>
              <ProgressBar value={34} color="bg-warning" />
            </div>
          </CardContent>
        </Card>

        {/* Project Health / Deliverables */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Project Milestones</CardTitle>
            <CardDescription>Active delivery objectives status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-50 dark:border-slate-800/40 pb-3.5">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Phase 3: Security Hardening</h4>
                <p className="text-xs text-slate-400 mt-0.5">Integration of IAM protocols and OAuth 2.0 gates.</p>
              </div>
              <Badge variant="secondary">In Progress</Badge>
            </div>

            <div className="flex items-start justify-between border-b border-slate-50 dark:border-slate-800/40 pb-3.5">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Phase 2: Spark Cluster Setup</h4>
                <p className="text-xs text-slate-400 mt-0.5">Deployment of PySpark analytics compute cluster.</p>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Phase 4: BI Dashboards Rollout</h4>
                <p className="text-xs text-slate-400 mt-0.5">Provisioning Metabase templates and metrics.</p>
              </div>
              <Badge variant="outline">Scheduled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default ClientOverview;
