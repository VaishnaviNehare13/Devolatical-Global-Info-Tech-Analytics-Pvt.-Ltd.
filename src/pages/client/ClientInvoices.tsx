import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { clientPortalApi, type ClientInvoiceItem } from '../../api/client-portal.api';
import { ApiError } from '../../types/api';
import { RefreshCw, AlertCircle, FileText, Download } from 'lucide-react';

interface InvoiceRecord {
  id: string;
  rawInvoice: ClientInvoiceItem;
  invoiceNumber: string;
  project: string;
  amount: string;
  status: string;
  date: string;
}

export const ClientInvoices: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<ClientInvoiceItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientPortalApi.getInvoices();
      if (res.data) {
        setInvoices(res.data);
      }
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to fetch invoice ledger from server.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownloadPdf = async (inv: ClientInvoiceItem) => {
    setDownloadingId(inv.id);
    try {
      showToast(`Initiating download for Invoice ${inv.invoiceNumber}...`, 'info');
      await clientPortalApi.downloadInvoicePdf(inv.id, inv.invoiceNumber);
      showToast(`Invoice ${inv.invoiceNumber} PDF downloaded successfully.`, 'success');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to download invoice PDF statement.';
      showToast(message, 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (!statusFilter) return true;
    return inv.status?.toUpperCase() === statusFilter.toUpperCase();
  });

  const displayData: InvoiceRecord[] = filteredInvoices.map((inv) => ({
    id: inv.id,
    rawInvoice: inv,
    invoiceNumber: inv.invoiceNumber,
    project: inv.description || inv.project?.name || 'Enterprise Service Deliverable',
    amount: `$${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    status: inv.status,
    date: inv.dueDate
      ? new Date(inv.dueDate).toLocaleDateString()
      : new Date(inv.createdAt).toLocaleDateString(),
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
    {
      key: 'id' as keyof InvoiceRecord,
      header: 'Statement PDF',
      render: (row: InvoiceRecord) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadPdf(row.rawInvoice)}
          disabled={downloadingId === row.id}
          className="h-8 text-xs font-semibold px-2.5"
        >
          {downloadingId === row.id ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5 text-secondary" />
          )}
          <span className="ml-1 hidden sm:inline">
            {downloadingId === row.id ? 'Downloading...' : 'PDF Statement'}
          </span>
        </Button>
      ),
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

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { label: 'All Invoices', value: '' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Paid', value: 'PAID' },
          { label: 'Overdue', value: 'OVERDUE' },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
            className="text-xs shrink-0"
          >
            {tab.label}
          </Button>
        ))}
      </div>

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
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {statusFilter
                  ? `No ${statusFilter.toLowerCase()} invoice statements matched your filter.`
                  : 'New billing statements and invoice receipts will appear here once generated.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientInvoices;
