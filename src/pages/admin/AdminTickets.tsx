import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import { ticketsApi } from '../../api/tickets.api';
import { usersApi } from '../../api/users.api';
import type { TicketSummary, TicketDetail, TicketComment } from '../../types/ticket';
import TicketConversation from '../../components/tickets/TicketConversation';
import { ApiError } from '../../types/api';
import {
  RefreshCw,
  AlertCircle,
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

interface DisplayTicketRecord {
  id: string;
  rawId: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  assignedToName: string;
  clientName: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export const AdminTickets: React.FC = () => {
  const { showToast } = useToast();

  // Tickets Directory State
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Selected Ticket State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null);
  const [ticketComments, setTicketComments] = useState<TicketComment[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Users State (for Assignee dropdown)
  const [staffUsers, setStaffUsers] = useState<Array<{ id: string; name: string }>>([]);

  // Create Ticket Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newCategory, setNewCategory] = useState('GENERAL');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Fetch Tickets List
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ticketsApi.listTickets({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
      });

      if (res.data) {
        setTickets(res.data.items || []);
      }
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : 'Failed to load support tickets directory.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, showToast]);

  // Fetch Staff Users for Assignee Selector
  const fetchStaffUsers = useCallback(async () => {
    try {
      const res = await usersApi.getUsers({ limit: 100 });
      if (res.data?.items) {
        setStaffUsers(
          res.data.items.map((u) => ({
            id: u.id,
            name: u.displayName || `${u.firstName} ${u.lastName}`.trim() || u.email,
          }))
        );
      }
    } catch {
      // Ignore if staff user list fails
    }
  }, []);

  // Fetch Selected Ticket Detail & Comments
  const fetchTicketDetail = useCallback(
    async (id: string) => {
      setIsLoadingDetail(true);
      setDetailError(null);
      try {
        const [detailRes, commentsRes] = await Promise.all([
          ticketsApi.getTicketById(id),
          ticketsApi.getComments(id),
        ]);

        if (detailRes.data) {
          setTicketDetail(detailRes.data);
        }
        if (commentsRes.data) {
          setTicketComments(commentsRes.data);
        }
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : 'Failed to load ticket detail details.';
        setDetailError(message);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTickets();
    fetchStaffUsers();
  }, [fetchTickets, fetchStaffUsers]);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetail(selectedTicketId);
    } else {
      setTicketDetail(null);
      setTicketComments([]);
    }
  }, [selectedTicketId, fetchTicketDetail]);

  // Handlers for Ticket Updates
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicketId) return;
    try {
      await ticketsApi.updateTicket(selectedTicketId, { status: newStatus });
      showToast(`Ticket status updated to ${newStatus}.`, 'success');
      await fetchTicketDetail(selectedTicketId);
      fetchTickets();
    } catch (err: unknown) {
      showToast('Failed to update ticket status.', 'error');
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    if (!selectedTicketId) return;
    try {
      await ticketsApi.updateTicket(selectedTicketId, { priority: newPriority });
      showToast(`Ticket priority updated to ${newPriority}.`, 'success');
      await fetchTicketDetail(selectedTicketId);
      fetchTickets();
    } catch (err: unknown) {
      showToast('Failed to update ticket priority.', 'error');
    }
  };

  const handleUpdateAssignee = async (assignedToId: string) => {
    if (!selectedTicketId) return;
    try {
      await ticketsApi.updateTicket(selectedTicketId, {
        assignedToId: assignedToId || null,
      });
      showToast('Ticket assignee updated successfully.', 'success');
      await fetchTicketDetail(selectedTicketId);
      fetchTickets();
    } catch (err: unknown) {
      showToast('Failed to update ticket assignee.', 'error');
    }
  };

  const handleArchiveTicket = async () => {
    if (!selectedTicketId) return;
    if (!window.confirm('Are you sure you want to archive this support ticket?')) return;
    try {
      await ticketsApi.archiveTicket(selectedTicketId);
      showToast('Ticket archived successfully.', 'info');
      setSelectedTicketId(null);
      fetchTickets();
    } catch (err: unknown) {
      showToast('Failed to archive ticket.', 'error');
    }
  };

  const handleRestoreTicket = async () => {
    if (!selectedTicketId) return;
    try {
      await ticketsApi.restoreTicket(selectedTicketId);
      showToast('Ticket restored to active status.', 'success');
      await fetchTicketDetail(selectedTicketId);
      fetchTickets();
    } catch (err: unknown) {
      showToast('Failed to restore ticket.', 'error');
    }
  };

  const handleSendReply = async (message: string, isInternal?: boolean) => {
    if (!selectedTicketId) return;
    await ticketsApi.createComment(selectedTicketId, { message, isInternal });
    showToast(isInternal ? 'Internal note posted.' : 'Public reply posted.', 'success');
    await fetchTicketDetail(selectedTicketId);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) {
      showToast('Subject and Description are required', 'error');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const res = await ticketsApi.createTicket({
        subject: newSubject.trim(),
        description: newDescription.trim(),
        priority: newPriority,
        category: newCategory,
      });

      showToast('New ticket created successfully.', 'success');
      setNewSubject('');
      setNewDescription('');
      setShowCreateModal(false);
      await fetchTickets();

      if (res.data?.id) {
        setSelectedTicketId(res.data.id);
      }
    } catch (err: unknown) {
      showToast('Failed to create support ticket.', 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const displayData: DisplayTicketRecord[] = tickets.map((tck) => ({
    id: tck.id.slice(0, 8).toUpperCase(),
    rawId: tck.id,
    subject: tck.subject,
    status: tck.status || 'OPEN',
    priority: tck.priority || 'MEDIUM',
    category: tck.category || 'GENERAL',
    assignedToName: tck.assignedTo?.displayName || tck.assignedTo?.email || 'Unassigned',
    clientName: tck.client?.name || 'Internal/Direct',
    updatedAt: new Date(tck.updatedAt || tck.createdAt).toLocaleDateString(),
  }));

  const columns = [
    { key: 'id' as keyof DisplayTicketRecord, header: 'Ref' },
    { key: 'subject' as keyof DisplayTicketRecord, header: 'Subject Title' },
    { key: 'clientName' as keyof DisplayTicketRecord, header: 'Client Organization' },
    { key: 'assignedToName' as keyof DisplayTicketRecord, header: 'Assignee' },
    {
      key: 'priority' as keyof DisplayTicketRecord,
      header: 'Priority',
      render: (row: DisplayTicketRecord) => {
        const variants: Record<string, 'danger' | 'warning' | 'outline'> = {
          CRITICAL: 'danger',
          HIGH: 'danger',
          MEDIUM: 'warning',
          LOW: 'outline',
        };
        return <Badge variant={variants[row.priority] || 'warning'}>{row.priority}</Badge>;
      },
    },
    {
      key: 'status' as keyof DisplayTicketRecord,
      header: 'Status',
      render: (row: DisplayTicketRecord) => {
        const variants: Record<string, 'secondary' | 'success' | 'outline'> = {
          OPEN: 'secondary',
          RESOLVED: 'success',
          CLOSED: 'outline',
        };
        return <Badge variant={variants[row.status] || 'secondary'}>{row.status}</Badge>;
      },
    },
    { key: 'updatedAt' as keyof DisplayTicketRecord, header: 'Updated' },
    {
      key: 'rawId' as keyof DisplayTicketRecord,
      header: 'Action',
      render: (row: DisplayTicketRecord) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedTicketId(row.rawId)}
        >
          Inspect & Reply
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {selectedTicketId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTicketId(null)}
                className="p-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-2xl font-bold tracking-tight">Support Tickets Console</h1>
          </div>
          <p className="text-sm text-slate-500">
            Administrative desk for managing client tickets, staff assignments, and resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!selectedTicketId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateModal(!showCreateModal)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Ticket
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchTickets();
              if (selectedTicketId) fetchTicketDetail(selectedTicketId);
            }}
            disabled={isLoading || isLoadingDetail}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${isLoading || isLoadingDetail ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-amber-800 dark:text-amber-200 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchTickets}>
            Retry
          </Button>
        </div>
      )}

      {/* Conditional Layout: Detail View vs Directory Grid */}
      {selectedTicketId ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Admin Management Sidebar */}
          <Card className="lg:col-span-4 h-fit">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  REF: {selectedTicketId.slice(0, 8).toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTicketId(null)}
                >
                  Close
                </Button>
              </div>
              <CardTitle className="text-lg mt-2">
                {isLoadingDetail ? <Skeleton className="h-6 w-3/4" /> : ticketDetail?.subject}
              </CardTitle>
              <CardDescription>Administrative Metadata & Control Controls</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 text-sm">
              {isLoadingDetail ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : ticketDetail ? (
                <>
                  {/* Status Management Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ticket Status
                    </label>
                    <select
                      value={ticketDetail.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="OPEN">OPEN (Active Desk)</option>
                      <option value="RESOLVED">RESOLVED (Solution Provided)</option>
                      <option value="CLOSED">CLOSED (Completed)</option>
                    </select>
                  </div>

                  {/* Priority Management Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ticket Priority
                    </label>
                    <select
                      value={ticketDetail.priority}
                      onChange={(e) => handleUpdatePriority(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  {/* Staff Assignee Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Assigned Staff Member
                    </label>
                    <select
                      value={ticketDetail.assignedToId || ''}
                      onChange={(e) => handleUpdateAssignee(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {staffUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Client & Project Info */}
                  <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Client Organization</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {ticketDetail.client?.name || 'Direct Internal'}
                      </span>
                    </div>
                    {ticketDetail.project && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 font-medium">Associated Project</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ticketDetail.project.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400">
                      <span>Category</span>
                      <Badge variant="outline">{ticketDetail.category || 'GENERAL'}</Badge>
                    </div>
                  </div>

                  {/* Ticket Description Box */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Original Problem Description
                    </h4>
                    <p className="p-3 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {ticketDetail.description}
                    </p>
                  </div>

                  {/* Archive / Restore Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleArchiveTicket}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Archive
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRestoreTicket}
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Restore
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      className="text-xs"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      Quick Resolve
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">Unable to load ticket detail.</p>
              )}
            </CardContent>
          </Card>

          {/* Admin Conversation Thread */}
          <div className="lg:col-span-8">
            <TicketConversation
              comments={ticketComments}
              isLoading={isLoadingDetail}
              error={detailError}
              onSendReply={handleSendReply}
              allowInternalNotes={true}
              onRetry={() => fetchTicketDetail(selectedTicketId)}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Create Ticket Modal for Admin */}
          {showCreateModal && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Create Support Ticket (Admin Portal)</CardTitle>
                <CardDescription>File a ticket on behalf of a client or team.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <Input
                    label="Subject Title"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    required
                    disabled={isSubmittingCreate}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Priority Level
                      </label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                      >
                        <option value="GENERAL">GENERAL</option>
                        <option value="TECHNICAL">TECHNICAL</option>
                        <option value="BILLING">BILLING</option>
                        <option value="FEATURE_REQUEST">FEATURE_REQUEST</option>
                        <option value="BUG">BUG</option>
                      </select>
                    </div>
                  </div>

                  <TextArea
                    label="Problem Description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    required
                    disabled={isSubmittingCreate}
                  />

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      disabled={isSubmittingCreate}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isSubmittingCreate}
                    >
                      {isSubmittingCreate ? 'Creating Ticket...' : 'Create Ticket'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Directory Filter Bar */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">OPEN Only</option>
                  <option value="RESOLVED">RESOLVED Only</option>
                  <option value="CLOSED">CLOSED Only</option>
                </select>
              </div>

              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="">All Priorities</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  <option value="TECHNICAL">TECHNICAL</option>
                  <option value="BILLING">BILLING</option>
                  <option value="GENERAL">GENERAL</option>
                  <option value="FEATURE_REQUEST">FEATURE_REQUEST</option>
                  <option value="BUG">BUG</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Tickets Directory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Global Ticket Directory</CardTitle>
              <CardDescription>
                Comprehensive listing of active, resolved, and archived tickets across client tenants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={displayData}
                  searchKey="subject"
                  rowsPerPage={10}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
