import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';
import { clientPortalApi, type ClientInvoiceItem } from '../../api/client-portal.api';
import { RefreshCw, AlertCircle, FileText } from 'lucide-react';

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  project: string;
  amount: string;
  status: string;
  date: string;
}

export const ClientInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<ClientInvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientPortalApi.getInvoices();
      if (res.data) {
        setInvoices(res.data);
      }
    } catch {
      setError('Failed to fetch invoice ledger from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const displayData: InvoiceRecord[] = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    project: inv.description || inv.project?.name || 'Enterprise Deliverable Service',
    amount: `$${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    status: inv.status,
    date: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : new Date(inv.createdAt).toLocaleDateString(),
  }));

  const columns = [
    { key: 'invoiceNumber' as keyof InvoiceRecord, header: 'Invoice Number' },
    { key: 'project' as keyof InvoiceRecord, header: 'Service Description' },
    { key: 'amount' as keyof InvoiceRecord, header: 'Amount' },
    { key: 'date' as keyof InvoiceRecord, header: 'Billing Date' },
    {
      key: 'status' as keyof InvoiceRecord,
      header: 'Status',
      render: (row: InvoiceRecord) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'outline'> = {
          PAID: 'success',
          Paid: 'success',
          PENDING: 'warning',
          Processing: 'warning',
          OVERDUE: 'danger',
          Overdue: 'danger',
        };
        return <Badge variant={variants[row.status] || 'outline'}>{row.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Invoices & Billing</h1>
          <p className="text-sm text-slate-500">
            Access billing histories, verify outstanding invoice balances, and download transaction PDF receipts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInvoices} disabled={isLoading}>
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
          <Button variant="ghost" size="sm" onClick={fetchInvoices}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice Ledger</CardTitle>
          <CardDescription>History of financial statements and transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : displayData.length > 0 ? (
            <DataTable columns={columns} data={displayData} searchKey="invoiceNumber" rowsPerPage={5} />
          ) : (
            <div className="py-12 text-center space-y-2">
              <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No invoices found in account ledger
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default ClientInvoices;
