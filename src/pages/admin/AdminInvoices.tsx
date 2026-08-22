import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { invoicesApi } from '../../api/invoices.api';
import { clientsApi } from '../../api/clients.api';
import { projectsApi } from '../../api/projects.api';
import type { InvoiceItem, FindInvoicesQuery } from '../../types/invoice';
import type { ClientSummary } from '../../types/client';
import type { ProjectSummary } from '../../types/project';
import { ApiError } from '../../types/api';
import { formatCurrency } from '../../utils/formatters';
import {
  FileText,
  Search,
  RefreshCw,
  Plus,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Building,
  FolderKanban,
  Filter,
  DollarSign,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AdminInvoices: React.FC = () => {
  const { showToast } = useToast();

  // Invoice List & Pagination State
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Client & Project Dropdown Options
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createInvoiceNumber, setCreateInvoiceNumber] = useState<string>('');
  const [createAmount, setCreateAmount] = useState<string>('');
  const [createCurrency, setCreateCurrency] = useState<string>('INR');
  const [createStatus, setCreateStatus] = useState<string>('PENDING');
  const [createDueDate, setCreateDueDate] = useState<string>('');
  const [createClientId, setCreateClientId] = useState<string>('');
  const [createProjectId, setCreateProjectId] = useState<string>('');
  const [createDescription, setCreateDescription] = useState<string>('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  // Edit Modal State
  const [editingInvoice, setEditingInvoice] = useState<InvoiceItem | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('PENDING');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [deletingInvoice, setDeletingInvoice] = useState<InvoiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Client and Project selector options
  const fetchClientsAndProjects = useCallback(async () => {
    try {
      const clientRes = await clientsApi.listClients({ limit: 100 });
      setClients(clientRes.data?.items || []);
    } catch {
      setClients([]);
    }
    try {
      const projectRes = await projectsApi.listProjects({ limit: 100 });
      setProjects(projectRes.data?.items || []);
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    fetchClientsAndProjects();
  }, [fetchClientsAndProjects]);

  // Fetch Invoices List
  const fetchInvoices = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const queryParams: FindInvoicesQuery = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          clientId: clientFilter || undefined,
          projectId: projectFilter || undefined,
          sortField: 'createdAt',
          sortOrder: 'desc',
        };

        const res = await invoicesApi.listInvoices(queryParams);
        const data = res.data;

        setInvoices(data?.items || []);
        setTotalCount(data?.total ?? data?.items?.length ?? 0);
        setTotalPages(data?.pages ?? Math.ceil((data?.total ?? 1) / pageSize) ?? 1);
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch invoice financial records.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, statusFilter, clientFilter, projectFilter, showToast]
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Calculate Summary Statistics
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let paidTotal = 0;
    let pendingTotal = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      const numAmount = Number(inv.amount) || 0;
      totalRevenue += numAmount;
      const statusUpper = inv.status?.toUpperCase();
      if (statusUpper === 'PAID') {
        paidTotal += numAmount;
      } else if (statusUpper === 'PENDING') {
        pendingTotal += numAmount;
      } else if (statusUpper === 'OVERDUE') {
        overdueCount += 1;
      }
    });

    return { totalRevenue, paidTotal, pendingTotal, overdueCount };
  }, [invoices]);

  // Download PDF Handler
  const handleDownloadPdf = async (inv: InvoiceItem) => {
    setDownloadingId(inv.id);
    try {
      showToast(`Generating PDF statement for Invoice ${inv.invoiceNumber}...`, 'info');
      await invoicesApi.downloadInvoicePdf(inv.id, inv.invoiceNumber);
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

  // Open Create Modal & Pre-generate Invoice Number
  const handleOpenCreateModal = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateCode = new Date().toISOString().slice(0, 7).replace('-', '');
    setCreateInvoiceNumber(`INV-${dateCode}-${randomSuffix}`);
    setCreateAmount('');
    setCreateCurrency('INR');
    setCreateStatus('PENDING');
    setCreateDueDate('');
    setCreateClientId('');
    setCreateProjectId('');
    setCreateDescription('');
    setIsCreateModalOpen(true);
  };

  // Submit Create Invoice
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createInvoiceNumber.trim() || !createAmount || !createClientId) {
      showToast('Please specify invoice number, positive amount, and client account.', 'error');
      return;
    }

    const numericAmount = parseFloat(createAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Amount must be a positive number.', 'error');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await invoicesApi.createInvoice({
        invoiceNumber: createInvoiceNumber.trim(),
        amount: numericAmount,
        currency: createCurrency || 'INR',
        status: createStatus || 'PENDING',
        dueDate: createDueDate || undefined,
        clientId: createClientId,
        projectId: createProjectId || undefined,
        description: createDescription.trim() || undefined,
      });

      showToast(`Invoice ${createInvoiceNumber} successfully created.`, 'success');
      setIsCreateModalOpen(false);
      await fetchInvoices(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to create invoice statement.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (inv: InvoiceItem) => {
    setEditingInvoice(inv);
    setEditAmount(String(inv.amount));
    setEditStatus(inv.status || 'PENDING');
    setEditDueDate(inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '');
    setEditDescription(inv.description || '');
  };

  // Submit Edit Invoice
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const numericAmount = editAmount ? parseFloat(editAmount) : undefined;
    if (numericAmount !== undefined && (isNaN(numericAmount) || numericAmount <= 0)) {
      showToast('Invoice amount must be positive.', 'error');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await invoicesApi.updateInvoice(editingInvoice.id, {
        amount: numericAmount,
        status: editStatus,
        dueDate: editDueDate || undefined,
        description: editDescription.trim() || undefined,
      });

      showToast(`Invoice ${editingInvoice.invoiceNumber} updated successfully.`, 'success');
      setEditingInvoice(null);
      await fetchInvoices(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update invoice details.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Confirm Delete Invoice
  const handleDeleteConfirm = async () => {
    if (!deletingInvoice) return;

    setIsDeleting(true);
    try {
      await invoicesApi.deleteInvoice(deletingInvoice.id);
      showToast(`Invoice ${deletingInvoice.invoiceNumber} deleted successfully.`, 'success');
      setDeletingInvoice(null);
      await fetchInvoices(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to delete invoice.';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (status?: string): 'success' | 'warning' | 'danger' | 'outline' => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'danger';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Invoices & Financial Management</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} Records
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Generate billing statements, manage client balances, track payment statuses, and download official PDF invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInvoices(true)}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-1" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Summary Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Page Total Invoiced</p>
            <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(stats.totalRevenue)}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Settled / Paid</p>
            <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(stats.paidTotal)}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Balance</p>
            <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(stats.pendingTotal)}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Overdue Accounts</p>
            <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {stats.overdueCount} Statements
            </h3>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice number or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <select
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Invoices Table Card */}
      <Card className="p-0 overflow-hidden">
        {loadError && (
          <div className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20">
            <AlertCircle className="h-8 w-8 text-danger mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Unable to load financial statements
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchInvoices(false)}>
              Retry Request
            </Button>
          </div>
        )}

        {isLoading && !loadError && (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !loadError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark/40 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Invoice Number
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Client & Project Link
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Amount
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Billing / Due Date
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => {
                      const clientName = inv.client?.name || clients.find((c) => c.id === inv.clientId)?.name;
                      const projectName = inv.project?.name || projects.find((p) => p.id === inv.projectId)?.name;

                      return (
                        <tr
                          key={inv.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                                {inv.invoiceNumber}
                              </span>
                              {inv.description && (
                                <p className="text-xs text-slate-400 truncate max-w-xs">
                                  {inv.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {clientName ? (
                                <span className="inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  <Building className="h-3 w-3 mr-1 text-slate-400" />
                                  {clientName}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                              {projectName && (
                                <span className="inline-flex items-center text-[11px] text-secondary font-medium">
                                  <FolderKanban className="h-3 w-3 mr-1" />
                                  {projectName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {formatCurrency(inv.amount, inv.currency || 'INR')}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div>Issued: {new Date(inv.createdAt).toLocaleDateString()}</div>
                            {inv.dueDate && (
                              <div className="text-[11px] text-slate-400">
                                Due: {new Date(inv.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getStatusBadgeVariant(inv.status)} className="text-[10px]">
                              {inv.status || 'PENDING'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPdf(inv)}
                                disabled={downloadingId === inv.id}
                                className="h-8 text-xs px-2.5"
                                title="Download PDF Statement"
                              >
                                {downloadingId === inv.id ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5 text-secondary" />
                                )}
                                <span className="ml-1 hidden sm:inline">
                                  {downloadingId === inv.id ? 'PDF...' : 'PDF'}
                                </span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditModal(inv)}
                                className="h-8 w-8 p-0"
                                title="Edit Invoice Details"
                              >
                                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingInvoice(inv)}
                                className="h-8 w-8 p-0 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Delete Invoice Statement"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          No invoice statements found in ledger
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Create client billing records or adjust filter criteria using the control bar above.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark/20">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Showing page {currentPage} of {totalPages} ({totalCount} total records)
                </span>
                <div className="flex items-center space-x-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Invoice Statement"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
          <Input
            label="Invoice Number"
            value={createInvoiceNumber}
            onChange={(e) => setCreateInvoiceNumber(e.target.value)}
            placeholder="e.g. INV-202608-1001"
            required
            disabled={isSubmittingCreate}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Target Client Account *
            </label>
            <select
              value={createClientId}
              onChange={(e) => setCreateClientId(e.target.value)}
              required
              disabled={isSubmittingCreate}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">Select Client Account...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Associated Project (Optional)
            </label>
            <select
              value={createProjectId}
              onChange={(e) => setCreateProjectId(e.target.value)}
              disabled={isSubmittingCreate}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">No Associated Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (₹) *"
              type="number"
              step="0.01"
              value={createAmount}
              onChange={(e) => setCreateAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={isSubmittingCreate}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                value={createStatus}
                onChange={(e) => setCreateStatus(e.target.value)}
                disabled={isSubmittingCreate}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <Input
            label="Due Date (Optional)"
            type="date"
            value={createDueDate}
            onChange={(e) => setCreateDueDate(e.target.value)}
            disabled={isSubmittingCreate}
          />

          <TextArea
            label="Description / Scope of Work (Optional)"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            placeholder="Specify billable deliverables, milestones, or service items..."
            disabled={isSubmittingCreate}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmittingCreate}
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" disabled={isSubmittingCreate}>
              {isSubmittingCreate ? 'Creating Invoice...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        isOpen={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        title={`Edit Invoice ${editingInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            disabled={isSubmittingEdit}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Payment Workflow Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              disabled={isSubmittingEdit}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <Input
            label="Due Date"
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            disabled={isSubmittingEdit}
          />

          <TextArea
            label="Description / Scope of Work"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Specify billable deliverables or milestone details..."
            disabled={isSubmittingEdit}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingInvoice(null)}
              disabled={isSubmittingEdit}
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" disabled={isSubmittingEdit}>
              {isSubmittingEdit ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingInvoice}
        onClose={() => setDeletingInvoice(null)}
        title="Delete Invoice Statement"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
            <div className="text-xs space-y-1">
              <h5 className="font-semibold text-sm">Confirm Deletion</h5>
              <p>
                Are you sure you want to permanently delete invoice{' '}
                <span className="font-mono font-bold">{deletingInvoice?.invoiceNumber}</span>?
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                This action will remove the invoice billing statement record from the database.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingInvoice(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Invoice'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminInvoices;
