import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Activity, ShieldCheck, Terminal, Users } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Ops Center Overview</h1>
        <p className="text-sm text-slate-500">
          Global analytics, pipeline ingestion speeds, and user session monitoring logs.
        </p>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Compute Nodes</span>
            <Activity className="h-5 w-5 text-secondary" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">142 Active</h3>
            <p className="text-xs text-green-500 mt-1">✓ CPU load at 42% average</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Data Pipelines</span>
            <Terminal className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">8 Active</h3>
            <p className="text-xs text-green-500 mt-1">✓ No ingestion locks detected</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Security Gates</span>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">Zero-Trust Active</h3>
            <p className="text-xs text-slate-400 mt-1">SSL certificates verify ok</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Client Sessions</span>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">18 Connected</h3>
            <p className="text-xs text-slate-400 mt-1">Across regional clusters</p>
          </div>
        </Card>
      </div>

      {/* Central Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core System Graph Panel */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Global Traffic Telemetry</CardTitle>
            <CardDescription>Average API request speeds and processing latency limits (ms).</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-between">
            <div className="flex-1 flex items-end space-x-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-40 flex items-end">
                  <div className="w-full bg-secondary rounded-t h-3/4 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">08:00</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-40 flex items-end">
                  <div className="w-full bg-secondary rounded-t h-1/2" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">10:00</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-40 flex items-end">
                  <div className="w-full bg-secondary rounded-t h-5/6" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">12:00</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-40 flex items-end">
                  <div className="w-full bg-secondary rounded-t h-2/3" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">14:00</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-40 flex items-end">
                  <div className="w-full bg-accent rounded-t h-full animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">16:00</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-mono">
              <span>Peak Latency: 12ms</span>
              <span>Total processed transactions: 4.8 Million</span>
            </div>
          </CardContent>
        </Card>

        {/* Security / System Logs Panel */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Active administrative audit log feeds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Admin Authorized root login</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">IP address: 198.162.1.200</p>
              </div>
              <Badge variant="success">OK</Badge>
            </div>
            
            <div className="flex items-start justify-between border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Ingested Schema updated</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Affected database: schema_mktg</p>
              </div>
              <Badge variant="secondary">Sync</Badge>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">AWS cluster scale triggered</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Nodes provisioned: +12 instances</p>
              </div>
              <Badge variant="warning">Scale</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default AdminDashboard;
