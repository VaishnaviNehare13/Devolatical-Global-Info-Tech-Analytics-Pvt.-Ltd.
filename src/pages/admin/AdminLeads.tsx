import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { leadsApi } from '../../api/leads.api';
import type { LeadResponseItem, CreateLeadRequest, UpdateLeadRequest } from '../../api/leads.api';
import { ApiError } from '../../types/api';
import {
  Inbox,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Trash2,
  RotateCcw,
  AlertCircle,
  Filter,
  Clock,
  UserCheck,
  Building2,
} from 'lucide-react';

export const AdminLeads: React.FC = () => {
  const { showToast } = useToast();

  // Data & State
  const [leads, setLeads] = useState<LeadResponseItem[]>([]);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);

  // Modal States
  const [selectedLead, setSelectedLead] = useState<LeadResponseItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);

  // Form States
  const [createForm, setCreateForm] = useState<CreateLeadRequest>({
    name: '',
    email: '',
    companyName: '',
    source: 'WEBSITE',
    industry: 'Advanced Data Analytics',
    priority: 'MEDIUM',
    notes: '',
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState<boolean>(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);
  const [isSubmittingArchive, setIsSubmittingArchive] = useState<boolean>(false);

  // Fetch leads from backend
  const fetchLeads = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const params = {
          limit: 100,
          search: searchTerm.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
          includeDeleted,
        };

        const res = await leadsApi.getLeads(params);
        if (res.data) {
          setLeads(res.data.items || []);
          setTotalLeads(res.data.total ?? res.data.items?.length ?? 0);
        }
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to retrieve lead records.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchTerm, statusFilter, sourceFilter, includeDeleted, showToast]
  );

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Lead status badge styling
  const getStatusBadge = (status: string, isDeleted = false) => {
    if (isDeleted) return <Badge variant="outline">Archived</Badge>;
    switch (status) {
      case 'NEW':
        return <Badge variant="accent">New Inbound</Badge>;
      case 'QUALIFIED':
      case 'WON':
        return <Badge variant="success">{status}</Badge>;
      case 'LOST':
        return <Badge variant="danger">Lost</Badge>;
      case 'CONTACTED':
      case 'PROPOSAL_SENT':
      case 'NEGOTIATION':
        return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Open detail modal
  const handleOpenDetail = (lead: LeadResponseItem) => {
    setSelectedLead(lead);
    setUpdateStatus(lead.status);
    setUpdateNotes(lead.notes || '');
    setIsDetailModalOpen(true);
  };

  // Handle lead status / notes update
  const handleSaveLeadUpdate = async () => {
    if (!selectedLead) return;
    setIsSubmittingUpdate(true);
    try {
      const payload: UpdateLeadRequest = {
        status: updateStatus,
        notes: updateNotes.trim() || null,
      };

      const res = await leadsApi.updateLead(selectedLead.id, payload);
      showToast(`Lead "${selectedLead.name}" updated successfully.`, 'success');
      if (res.data) {
        setLeads((prev) => prev.map((l) => (l.id === res.data.id ? res.data : l)));
      }
      setIsDetailModalOpen(false);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : 'Failed to update lead record.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  // Handle manual lead creation
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!createForm.name.trim()) errors.name = 'Representative name is required.';
    if (createForm.email && !/\S+@\S+\.\S+/.test(createForm.email)) {
      errors.email = 'Invalid email address format.';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setCreateErrors({});
    setIsSubmittingCreate(true);
    try {
      const payload: CreateLeadRequest = {
        name: createForm.name.trim(),
        email: createForm.email?.trim() || null,
        companyName: createForm.companyName?.trim() || null,
        source: createForm.source || 'WEBSITE',
        industry: createForm.industry?.trim() || null,
        priority: createForm.priority || 'MEDIUM',
        notes: createForm.notes?.trim() || null,
      };

      const res = await leadsApi.createLead(payload);
      showToast(`Lead profile "${res.data.name}" created successfully.`, 'success');
      setCreateForm({
        name: '',
        email: '',
        companyName: '',
        source: 'WEBSITE',
        industry: 'Advanced Data Analytics',
        priority: 'MEDIUM',
        notes: '',
      });
      setIsCreateModalOpen(false);
      fetchLeads();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : 'Failed to create lead record.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Handle archive (soft delete)
  const handleArchiveLead = async () => {
    if (!selectedLead) return;
    setIsSubmittingArchive(true);
    try {
      await leadsApi.archiveLead(selectedLead.id);
      showToast(`Lead "${selectedLead.name}" archived successfully.`, 'success');
      setIsArchiveModalOpen(false);
      fetchLeads();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : 'Failed to archive lead record.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingArchive(false);
    }
  };

  // Handle restore
  const handleRestoreLead = async (lead: LeadResponseItem) => {
    try {
      await leadsApi.restoreLead(lead.id);
      showToast(`Lead "${lead.name}" restored to active status.`, 'success');
      fetchLeads();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : 'Failed to restore lead record.';
      showToast(message, 'error');
    }
  };

  // Counts for KPIs
  const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;
  const qualifiedLeadsCount = leads.filter((l) => l.status === 'QUALIFIED' || l.status === 'WON').length;
  const websiteLeadsCount = leads.filter((l) => l.source === 'WEBSITE').length;

  // Table Columns
  const columns = [
    {
      key: 'name' as keyof LeadResponseItem,
      header: 'Representative / Entity',
      render: (row: LeadResponseItem) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white text-xs">{row.name}</div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            {row.companyName && <span>{row.companyName}</span>}
            {row.email && (
              <>
                <span>•</span>
                <span>{row.email}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'source' as keyof LeadResponseItem,
      header: 'Source & Scope',
      render: (row: LeadResponseItem) => (
        <div className="space-y-0.5">
          <Badge variant="outline" className="text-[9px] font-mono uppercase">
            {row.source || 'WEBSITE'}
          </Badge>
          {row.industry && (
            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {row.industry}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status' as keyof LeadResponseItem,
      header: 'Status',
      render: (row: LeadResponseItem) => getStatusBadge(row.status, Boolean(row.deletedAt)),
    },
    {
      key: 'priority' as keyof LeadResponseItem,
      header: 'Priority',
      render: (row: LeadResponseItem) => (
        <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
          {row.priority || 'MEDIUM'}
        </span>
      ),
    },
    {
      key: 'createdAt' as keyof LeadResponseItem,
      header: 'Submitted',
      render: (row: LeadResponseItem) => (
        <div className="text-xs font-mono text-slate-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'id' as keyof LeadResponseItem,
      header: 'Actions',
      render: (row: LeadResponseItem) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleOpenDetail(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="View Details & Update"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {row.deletedAt ? (
            <button
              onClick={() => handleRestoreLead(row)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-500 cursor-pointer"
              title="Restore Lead"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedLead(row);
                setIsArchiveModalOpen(true);
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer"
              title="Archive Lead"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Scoping Leads & Inquiries</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalLeads} Records
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Manage public scoping inquiries, enterprise lead pipeline, and architectural contact requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeads(true)}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Queue
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Lead
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Inbound Leads
            </span>
            <Inbox className="h-5 w-5 text-secondary" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {totalLeads} Leads
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Database repository records</p>
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              New Inquiries
            </span>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {newLeadsCount} Pending
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Status: NEW</p>
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Qualified Pipeline
            </span>
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {qualifiedLeadsCount} Qualified
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Qualified or Won status</p>
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Website Inquiries
            </span>
            <Building2 className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {websiteLeadsCount} Form Leads
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Public Contact Form</p>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Error Alert Box */}
      {loadError && (
        <Card className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Lead Queue Synchronization Alert
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchLeads(false)}>
            Retry Queue Sync
          </Button>
        </Card>
      )}

      {/* Filter & Data Directory Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Enterprise Lead Directory</CardTitle>
              <CardDescription>
                Filtered list of project scoping requests, corporate inquiries, and leads.
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-secondary w-48"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-secondary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-secondary"
              >
                <option value="ALL">All Sources</option>
                <option value="WEBSITE">Website Form</option>
                <option value="REFERRAL">Referral</option>
                <option value="EMAIL">Email</option>
                <option value="PHONE">Phone</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="MANUAL">Manual Entry</option>
              </select>

              <label className="flex items-center space-x-1.5 text-xs text-slate-500 cursor-pointer font-mono">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span>Include Archived</span>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={leads} searchKey="name" rowsPerPage={10} />
          )}
        </CardContent>
      </Card>

      {/* Lead Detail & Status Update Modal */}
      {selectedLead && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Lead Details: ${selectedLead.name}`}
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 mb-2">Review scoping inquiry text, update lifecycle status, or edit notes.</p>
            <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block">Representative:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLead.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Company:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLead.companyName || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLead.email || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Source:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLead.source || 'WEBSITE'}
                  </span>
                </div>
              </div>
            </div>

            {selectedLead.industry && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Inquiry Scope / Industry Focus
                </label>
                <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200">
                  {selectedLead.industry}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                Scoping Requirements / Notes
              </label>
              <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 min-h-[80px] whitespace-pre-wrap">
                {selectedLead.notes || 'No project description provided.'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                  Update Lead Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-secondary"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                  <option value="NEGOTIATION">NEGOTIATION</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                  Internal Notes
                </label>
                <input
                  type="text"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add internal review notes..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
                disabled={isSubmittingUpdate}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveLeadUpdate}
                disabled={isSubmittingUpdate}
              >
                {isSubmittingUpdate ? 'Saving...' : 'Save Lead Updates'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Create Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Lead Profile"
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-left">
          <p className="text-xs text-slate-500 mb-2">Add a new scoping inquiry record to the enterprise database.</p>
          <Input
            label="Representative Name"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            error={createErrors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              value={createForm.email || ''}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              error={createErrors.email}
            />
            <Input
              label="Company Name"
              value={createForm.companyName || ''}
              onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                Lead Source
              </label>
              <select
                value={createForm.source || 'WEBSITE'}
                onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
              >
                <option value="WEBSITE">Website Form</option>
                <option value="REFERRAL">Referral</option>
                <option value="EMAIL">Email Inquiry</option>
                <option value="PHONE">Phone Inquiry</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="MANUAL">Manual Entry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                Industry Scope
              </label>
              <select
                value={createForm.industry || 'Advanced Data Analytics'}
                onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
              >
                <option value="Advanced Data Analytics">Advanced Data Analytics</option>
                <option value="IT Infrastructure">IT Infrastructure</option>
                <option value="Custom Software">Custom Software</option>
                <option value="Other">Other Enterprise Solution</option>
              </select>
            </div>
          </div>

          <TextArea
            label="Project Scope / Requirements"
            value={createForm.notes || ''}
            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              {isSubmittingCreate ? 'Creating Lead...' : 'Create Lead Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Archive Confirmation Modal */}
      {selectedLead && (
        <Modal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          title="Archive Lead Record"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500">
              Are you sure you want to soft-delete the lead record for &quot;{selectedLead.name}&quot;?
            </p>
            <p className="text-xs text-slate-400">
              The record will be soft-deleted and can be restored at any time by toggling &quot;Include Archived&quot; in the filter controls.
            </p>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsArchiveModalOpen(false)}
                disabled={isSubmittingArchive}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleArchiveLead}
                disabled={isSubmittingArchive}
              >
                {isSubmittingArchive ? 'Archiving...' : 'Confirm Soft Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminLeads;
