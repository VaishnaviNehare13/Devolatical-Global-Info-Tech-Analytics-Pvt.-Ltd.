import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

interface InvoiceRecord {
  id: string;
  project: string;
  amount: string;
  status: 'Paid' | 'Processing' | 'Overdue';
  date: string;
}

export const ClientInvoices: React.FC = () => {
  const columns = [
    { key: 'id' as keyof InvoiceRecord, header: 'Invoice ID' },
    { key: 'project' as keyof InvoiceRecord, header: 'Service description' },
    { key: 'amount' as keyof InvoiceRecord, header: 'Amount' },
    { key: 'date' as keyof InvoiceRecord, header: 'Billing Date' },
    {
      key: 'status' as keyof InvoiceRecord,
      header: 'Status',
      render: (row: InvoiceRecord) => {
        const variants = {
          Paid: 'success' as const,
          Processing: 'warning' as const,
          Overdue: 'danger' as const
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  const data: InvoiceRecord[] = [
    { id: 'INV-2026-004', project: 'Enterprise Cloud Architecture Setup', amount: '$42,500.00', status: 'Paid', date: '2026-06-30' },
    { id: 'INV-2026-003', project: 'Advanced Data Pipelines Provisioning', amount: '$28,000.00', status: 'Paid', date: '2026-05-15' },
    { id: 'INV-2026-002', project: 'BI Dashboards Custom Integration', amount: '$15,400.00', status: 'Paid', date: '2026-04-01' },
    { id: 'INV-2026-001', project: 'Initial Consulting and Discovery phase', amount: '$10,000.00', status: 'Paid', date: '2026-03-01' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Invoices & Billing</h1>
        <p className="text-sm text-slate-500">
          Access billing histories, verify outstanding invoice balances, and download transaction PDF receipts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Ledger</CardTitle>
          <CardDescription>History of financial statements and transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} searchKey="id" rowsPerPage={5} />
        </CardContent>
      </Card>
    </div>
  );
};
export default ClientInvoices;
