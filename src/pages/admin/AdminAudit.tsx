import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

interface AuditRecord {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  ip: string;
  status: 'SUCCESS' | 'DENIED';
}

export const AdminAudit: React.FC = () => {
  const columns = [
    { key: 'timestamp' as keyof AuditRecord, header: 'Timestamp' },
    { key: 'actor' as keyof AuditRecord, header: 'Actor (User)' },
    { key: 'action' as keyof AuditRecord, header: 'Action Executed' },
    { key: 'resource' as keyof AuditRecord, header: 'Target Resource' },
    { key: 'ip' as keyof AuditRecord, header: 'IP Address' },
    {
      key: 'status' as keyof AuditRecord,
      header: 'Authorization',
      render: (row: AuditRecord) => {
        const variants = {
          SUCCESS: 'success' as const,
          DENIED: 'danger' as const
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  const data: AuditRecord[] = [
    { id: '1', actor: 'devolaticalglobalinfotech@gmail.com', action: 'DATABASE_SCHEMA_ALTER', resource: 'schema_mktg', timestamp: '2026-07-17 13:42:04', ip: '198.162.1.200', status: 'SUCCESS' },
    { id: '2', actor: 'devolaticalglobalinfotech@gmail.com', action: 'IAM_ACCESS_TOKEN_REVOKE', resource: 'token_usr_48', timestamp: '2026-07-17 12:15:30', ip: '198.162.1.204', status: 'SUCCESS' },
    { id: '3', actor: 'guest_user@external-audit.com', action: 'DATALAKE_ROOT_SSH_ATTEMPT', resource: 'datalake_core', timestamp: '2026-07-17 11:02:12', ip: '42.100.12.8', status: 'DENIED' },
    { id: '4', actor: 'devolaticalglobalinfotech@gmail.com', action: 'AWS_AUTO_SCALE_CONFIG_MOD', resource: 'k8s_cluster_prod', timestamp: '2026-07-17 09:30:00', ip: '198.162.1.200', status: 'SUCCESS' },
    { id: '5', actor: 'devolaticalglobalinfotech@gmail.com', action: 'BILLING_INVOICE_GENERATE', resource: 'invoice_ledger_q2', timestamp: '2026-07-17 08:45:00', ip: '198.162.1.212', status: 'SUCCESS' }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">System Audit Logs</h1>
        <p className="text-sm text-slate-500">
          Verify system-wide access modifications, administrative actions, and block records.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity Ledger</CardTitle>
          <CardDescription>Security compliance tracking for all internal administrative action histories.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} searchKey="actor" rowsPerPage={5} />
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminAudit;
