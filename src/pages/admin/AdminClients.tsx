import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Checkbox } from '../../components/ui/Checkbox';
import { useToast } from '../../components/ui/Toast';
import { clientsApi } from '../../api/clients.api';
import { usersApi } from '../../api/users.api';
import type { ClientSummary, ClientDetail, CreateClientRequest, UpdateClientRequest, FindClientsQuery } from '../../types/client';
import type { UserSummary } from '../../types/user';
import { ApiError } from '../../types/api';
import {
  Building2,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  AlertCircle,
  UserCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
  Eye,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export const AdminClients: React.FC = () => {
  const { showToast } = useToast();

  // Data States
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [totalClients, setTotalClients] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [staffUsers, setStaffUsers] = useState<UserSummary[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<ClientSummary | null>(null);
  const [inspectingClient, setInspectingClient] = useState<ClientDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [archivingClient, setArchivingClient] = useState<ClientSummary | null>(null);
  const [restoringClient, setRestoringClient] = useState<ClientSummary | null>(null);

  // Form States
  const [clientForm, setClientForm] = useState<CreateClientRequest>({
    name: '',
    code: '',
    email: '',
    phone: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    notes: '',
    accountManagerId: '',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Staff Users for Account Manager Selector
  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        const userRes = await usersApi.getUsers({ limit: 100 });
        setStaffUsers(userRes.data?.items || []);
      } catch {
        // Non-blocking user fetch error
      }
    };
    fetchStaffUsers();
  }, []);

  // Fetch Clients Directory List
  const fetchClients = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const queryParams: FindClientsQuery = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          includeDeleted: includeDeleted || undefined,
          sortField: 'createdAt',
          sortOrder: 'desc',
        };

        const res = await clientsApi.listClients(queryParams);
        const data = res.data;

        setClients(data?.items || []);
        setTotalClients(data?.total ?? data?.items?.length ?? 0);
      } catch (err: unknown) {
        const msg = ApiError.isApiError(err) ? err.message : 'Failed to load client directory from server.';
        setLoadError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, statusFilter, includeDeleted]
  );

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Open Create Client Modal
  const handleOpenCreateModal = () => {
    setClientForm({
      name: '',
      code: '',
      email: '',
      phone: '',
      website: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      notes: '',
      accountManagerId: staffUsers[0]?.id || '',
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Submit Create Client
  const handleCreateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim() || !clientForm.code.trim()) {
      setFormError('Organization Name and Company Code are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await clientsApi.createClient({
        name: clientForm.name.trim(),
        code: clientForm.code.trim().toUpperCase(),
        email: clientForm.email?.trim() || undefined,
        phone: clientForm.phone?.trim() || undefined,
        website: clientForm.website?.trim() || undefined,
        addressLine1: clientForm.addressLine1?.trim() || undefined,
        addressLine2: clientForm.addressLine2?.trim() || undefined,
        city: clientForm.city?.trim() || undefined,
        state: clientForm.state?.trim() || undefined,
        country: clientForm.country?.trim() || undefined,
        postalCode: clientForm.postalCode?.trim() || undefined,
        notes: clientForm.notes?.trim() || undefined,
        accountManagerId: clientForm.accountManagerId || undefined,
        status: clientForm.status,
      });

      showToast('Client organization account created successfully.', 'success');
      setIsCreateModalOpen(false);
      await fetchClients();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to create client account.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Inspect Detail Modal
  const handleOpenInspect = async (client: ClientSummary) => {
    setIsLoadingDetail(true);
    setInspectingClient(null);
    try {
      const res = await clientsApi.getClientById(client.id);
      setInspectingClient(res.data);
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to load client details.';
      showToast(msg, 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Open Edit Client Modal
  const handleOpenEditModal = async (client: ClientSummary) => {
    setEditingClient(client);
    setFormError(null);

    try {
      const res = await clientsApi.getClientById(client.id);
      const detail = res.data;
      setClientForm({
        name: detail.name,
        code: detail.code,
        email: detail.email || '',
        phone: detail.phone || '',
        website: detail.website || '',
        addressLine1: detail.addressLine1 || '',
        addressLine2: detail.addressLine2 || '',
        city: detail.city || '',
        state: detail.state || '',
        country: detail.country || '',
        postalCode: detail.postalCode || '',
        notes: detail.notes || '',
        accountManagerId: detail.accountManagerId || '',
        status: detail.status,
      });
    } catch {
      setClientForm({
        name: client.name,
        code: client.code,
        email: client.email || '',
        phone: client.phone || '',
        website: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        notes: '',
        accountManagerId: client.accountManagerId || '',
        status: client.status,
      });
    }
  };

  // Submit Update Client
  const handleUpdateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!clientForm.name.trim() || !clientForm.code.trim()) {
      setFormError('Organization Name and Company Code are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const updateData: UpdateClientRequest = {
        name: clientForm.name.trim(),
        code: clientForm.code.trim().toUpperCase(),
        email: clientForm.email?.trim() || undefined,
        phone: clientForm.phone?.trim() || undefined,
        website: clientForm.website?.trim() || undefined,
        addressLine1: clientForm.addressLine1?.trim() || undefined,
        addressLine2: clientForm.addressLine2?.trim() || undefined,
        city: clientForm.city?.trim() || undefined,
        state: clientForm.state?.trim() || undefined,
        country: clientForm.country?.trim() || undefined,
        postalCode: clientForm.postalCode?.trim() || undefined,
        notes: clientForm.notes?.trim() || undefined,
        accountManagerId: clientForm.accountManagerId || null,
        status: clientForm.status,
      };

      await clientsApi.updateClient(editingClient.id, updateData);
      showToast('Client organization profile updated.', 'success');
      setEditingClient(null);
      await fetchClients();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to update client profile.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Archive Client
  const handleArchiveClient = async () => {
    if (!archivingClient) return;
    setIsSubmitting(true);
    try {
      await clientsApi.archiveClient(archivingClient.id);
      showToast(`Client organization "${archivingClient.name}" archived successfully.`, 'success');
      setArchivingClient(null);
      await fetchClients();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to archive client account.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restore Client
  const handleRestoreClient = async () => {
    if (!restoringClient) return;
    setIsSubmitting(true);
    try {
      await clientsApi.restoreClient(restoringClient.id);
      showToast(`Client organization "${restoringClient.name}" restored successfully.`, 'success');
      setRestoringClient(null);
      await fetchClients();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to restore client account.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculated Stats from Live Data
  const activeCount = clients.filter((c) => c.status === 'ACTIVE').length;
  const prospectCount = clients.filter((c) => c.status === 'PROSPECT' || c.status === 'ONBOARDING').length;
  const archivedCount = clients.filter((c) => !!c.deletedAt).length;

  const statusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'success';
      case 'PROSPECT':
      case 'ONBOARDING':
        return 'secondary';
      case 'INACTIVE':
      case 'SUSPENDED':
        return 'danger';
      default:
        return 'outline';
    }
  };

  // Table Columns Definition
  const columns = [
    {
      key: 'name' as keyof ClientSummary,
      header: 'Organization / Code',
      render: (c: ClientSummary) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
              {c.code}
            </span>
            {c.deletedAt && <Badge variant="danger" className="text-[9px]">Archived</Badge>}
          </div>
          <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[220px]">
            {c.name}
          </span>
        </div>
      ),
    },
    {
      key: 'email' as keyof ClientSummary,
      header: 'Contact Info',
      render: (c: ClientSummary) => (
        <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{c.email || 'No email registered'}</span>
          </div>
          {c.phone && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span>{c.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'accountManager' as keyof ClientSummary,
      header: 'Account Manager',
      render: (c: ClientSummary) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <UserCheck className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate max-w-[140px]">
            {c.accountManager?.displayName || 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      key: 'status' as keyof ClientSummary,
      header: 'Account Status',
      render: (c: ClientSummary) => (
        <Badge variant={statusVariant(c.status)}>{c.status || 'ACTIVE'}</Badge>
      ),
    },
    {
      key: 'createdAt' as keyof ClientSummary,
      header: 'Created On',
      render: (c: ClientSummary) => (
        <span className="font-mono text-[11px] text-slate-500">
          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions' as keyof ClientSummary,
      header: 'Actions',
      render: (c: ClientSummary) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-secondary hover:bg-secondary/10"
            onClick={() => handleOpenInspect(c)}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> View
          </Button>

          {!c.deletedAt ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleOpenEditModal(c)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-danger hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => setArchivingClient(c)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px] text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              onClick={() => setRestoringClient(c)}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Client CRM & Account Management</h1>
          <p className="text-sm text-slate-500">
            Enterprise client organization directory, account managers, corporate contacts, and portal access accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchClients(true)} disabled={isLoading || isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-1.5" /> New Client Account
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Total Client Directory</span>
            <Building2 className="h-4 w-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalClients}</div>
          <div className="text-[10px] text-slate-400">Registered corporate accounts</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Active Client Orgs</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <div className="text-[10px] text-slate-400">In active contract / delivery</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Prospects & Onboarding</span>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{prospectCount}</div>
          <div className="text-[10px] text-slate-400">Pipeline & onboarding stage</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Archived Accounts</span>
            <Trash2 className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{archivedCount}</div>
          <div className="text-[10px] text-slate-400">Soft-deleted accounts</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, company code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PROSPECT">PROSPECT</option>
                <option value="ONBOARDING">ONBOARDING</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <Checkbox
              id="includeDeletedClients"
              label="Include Archived"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Main Table Content */}
      {loadError && (
        <Card className="p-8 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Unable to load client directory</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchClients(false)}>
            Retry Request
          </Button>
        </Card>
      )}

      {isLoading && !loadError && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      )}

      {!isLoading && !loadError && (
        <Card>
          <CardHeader>
            <CardTitle>Client Account Directory</CardTitle>
            <CardDescription>Corporate client organizations, account managers, and corporate contacts.</CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length > 0 ? (
              <DataTable columns={columns} data={clients} rowsPerPage={pageSize} />
            ) : (
              <div className="py-12 text-center space-y-2">
                <Building2 className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No client accounts found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No client organization profiles match your search criteria or status filter.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Client Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Client Account">
        <form onSubmit={handleCreateClientSubmit} className="space-y-4 text-left text-xs">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Organization Name <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="e.g. AcroCorp Global Inc."
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Company Code <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="e.g. CLT-ACRO-01"
                value={clientForm.code}
                onChange={(e) => setClientForm({ ...clientForm, code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Corporate Email</label>
              <Input
                type="email"
                placeholder="billing@acrocorp.com"
                value={clientForm.email || ''}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Contact Phone</label>
              <Input
                placeholder="+1 (555) 019-2834"
                value={clientForm.phone || ''}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Account Status</label>
              <select
                value={clientForm.status}
                onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PROSPECT">PROSPECT</option>
                <option value="ONBOARDING">ONBOARDING</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Account Manager</label>
              <select
                value={clientForm.accountManagerId || ''}
                onChange={(e) => setClientForm({ ...clientForm, accountManagerId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Website URL</label>
              <Input
                placeholder="https://acrocorp.com"
                value={clientForm.website || ''}
                onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Address Line 1</label>
              <Input
                placeholder="100 Enterprise Way"
                value={clientForm.addressLine1 || ''}
                onChange={(e) => setClientForm({ ...clientForm, addressLine1: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">City / State</label>
              <div className="flex gap-2">
                <Input
                  placeholder="City"
                  value={clientForm.city || ''}
                  onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  value={clientForm.state || ''}
                  onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">Notes / Account Overview</label>
            <TextArea
              rows={3}
              placeholder="Enterprise account background and contact history..."
              value={clientForm.notes || ''}
              onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Client Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={!!editingClient} onClose={() => setEditingClient(null)} title="Edit Client Organization">
        <form onSubmit={handleUpdateClientSubmit} className="space-y-4 text-left text-xs">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Organization Name <span className="text-danger">*</span>
              </label>
              <Input
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Company Code <span className="text-danger">*</span>
              </label>
              <Input
                value={clientForm.code}
                onChange={(e) => setClientForm({ ...clientForm, code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Corporate Email</label>
              <Input
                type="email"
                value={clientForm.email || ''}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Contact Phone</label>
              <Input
                value={clientForm.phone || ''}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Account Status</label>
              <select
                value={clientForm.status}
                onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PROSPECT">PROSPECT</option>
                <option value="ONBOARDING">ONBOARDING</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Account Manager</label>
              <select
                value={clientForm.accountManagerId || ''}
                onChange={(e) => setClientForm({ ...clientForm, accountManagerId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Website URL</label>
              <Input
                value={clientForm.website || ''}
                onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">Notes / Account Overview</label>
            <TextArea
              rows={3}
              value={clientForm.notes || ''}
              onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setEditingClient(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Inspect Detail Modal */}
      <Modal isOpen={!!inspectingClient || isLoadingDetail} onClose={() => setInspectingClient(null)} title="Client Profile Details">
        {isLoadingDetail && (
          <div className="space-y-3 p-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}

        {inspectingClient && !isLoadingDetail && (
          <div className="space-y-4 text-left text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                  {inspectingClient.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{inspectingClient.name}</h3>
              </div>
              <Badge variant={statusVariant(inspectingClient.status)}>{inspectingClient.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{inspectingClient.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{inspectingClient.phone || 'N/A'}</span>
                </div>
                {inspectingClient.website && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <a href={inspectingClient.website} target="_blank" rel="noreferrer" className="text-secondary hover:underline truncate">
                      {inspectingClient.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  <span>Account Manager: {inspectingClient.accountManager?.displayName || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>
                    {[inspectingClient.city, inspectingClient.state, inspectingClient.country].filter(Boolean).join(', ') || 'Address N/A'}
                  </span>
                </div>
              </div>
            </div>

            {inspectingClient.notes && (
              <div className="p-3 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> Notes & Background
                </span>
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{inspectingClient.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Archive Client Confirmation */}
      <Modal isOpen={!!archivingClient} onClose={() => setArchivingClient(null)} title="Archive Client Account">
        {archivingClient && (
          <div className="space-y-4 text-left text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Archive Client Organization</span>
                <span>
                  Are you sure you want to archive <strong>{archivingClient.name}</strong> ({archivingClient.code})? It can be restored later using the archived toggle.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setArchivingClient(null)}>
                Cancel
              </Button>
              <Button variant="secondary" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleArchiveClient} disabled={isSubmitting}>
                {isSubmitting ? 'Archiving...' : 'Archive Account'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Restore Client Confirmation */}
      <Modal isOpen={!!restoringClient} onClose={() => setRestoringClient(null)} title="Restore Client Account">
        {restoringClient && (
          <div className="space-y-4 text-left text-xs">
            <p>
              Restore client organization <strong>{restoringClient.name}</strong> back to active registry?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setRestoringClient(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleRestoreClient} disabled={isSubmitting}>
                {isSubmitting ? 'Restoring...' : 'Restore Account'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminClients;
