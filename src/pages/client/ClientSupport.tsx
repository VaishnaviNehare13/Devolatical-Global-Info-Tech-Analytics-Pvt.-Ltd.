import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import {
  clientPortalApi,
  type ClientTicketItem,
  type ClientTicketDetail,
  type ClientProjectItem,
} from '../../api/client-portal.api';
import { ApiError } from '../../types/api';
import TicketConversation from '../../components/tickets/TicketConversation';
import { RefreshCw, AlertCircle, ArrowLeft, Plus, Briefcase, Tag, Clock } from 'lucide-react';

interface TicketRecord {
  id: string;
  rawId: string;
  subject: string;
  severity: string;
  status: string;
  projectName: string;
  updatedAt: string;
}

export const ClientSupport: React.FC = () => {
  const { showToast } = useToast();

  // Create Ticket Form State
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [projectId, setProjectId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<ClientProjectItem[]>([]);

  // Tickets List State
  const [tickets, setTickets] = useState<ClientTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Ticket Detail & Conversation State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetail, setTicketDetail] = useState<ClientTicketDetail | null>(null);
  const [isLoadingDetail, setIsLoadingLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientPortalApi.getTickets();
      if (res.data) {
        setTickets(res.data);
      }
    } catch {
      setError('Failed to fetch support tickets log.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await clientPortalApi.getProjects();
      if (res.data) {
        setProjects(res.data);
      }
    } catch {
      // Projects optional
    }
  }, []);

  const fetchTicketDetail = useCallback(async (ticketId: string) => {
    setIsLoadingLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await clientPortalApi.getTicketById(ticketId);
      if (res.data) {
        setTicketDetail(res.data);
      }
    } catch (err: unknown) {
      setDetailError(
        err instanceof Error ? err.message : 'Failed to retrieve ticket details.'
      );
    } finally {
      setIsLoadingLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchProjects();
  }, [fetchTickets, fetchProjects]);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetail(selectedTicketId);
    } else {
      setTicketDetail(null);
    }
  }, [selectedTicketId, fetchTicketDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Subject and Description are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTicket = await clientPortalApi.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority: severity.toUpperCase(),
        projectId: projectId || undefined,
      });

      showToast('Support ticket filed successfully. Engineering notified.', 'success');
      setSubject('');
      setDescription('');
      setProjectId('');
      setShowCreateModal(false);
      await fetchTickets();

      if (newTicket.data?.id) {
        setSelectedTicketId(newTicket.data.id);
      }
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to file support ticket. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (message: string) => {
    if (!selectedTicketId) return;
    await clientPortalApi.createTicketComment(selectedTicketId, { message });
    showToast('Reply posted successfully.', 'success');
    await fetchTicketDetail(selectedTicketId);
    fetchTickets();
  };

  const displayData: TicketRecord[] = tickets.map((tck) => ({
    id: tck.id.slice(0, 8).toUpperCase(),
    rawId: tck.id,
    subject: tck.subject,
    severity: tck.priority || 'MEDIUM',
    status: tck.status || 'OPEN',
    projectName: tck.project?.name || 'General Org Support',
    updatedAt: new Date(tck.updatedAt || tck.createdAt).toLocaleDateString(),
  }));

  const columns = [
    { key: 'id' as keyof TicketRecord, header: 'Ref' },
    { key: 'subject' as keyof TicketRecord, header: 'Subject Title' },
    { key: 'projectName' as keyof TicketRecord, header: 'Associated Workstream' },
    {
      key: 'severity' as keyof TicketRecord,
      header: 'Severity',
      render: (row: TicketRecord) => {
        const variants: Record<string, 'danger' | 'warning' | 'outline'> = {
          HIGH: 'danger',
          CRITICAL: 'danger',
          High: 'danger',
          MEDIUM: 'warning',
          Medium: 'warning',
          LOW: 'outline',
          Low: 'outline',
        };
        return <Badge variant={variants[row.severity] || 'warning'}>{row.severity}</Badge>;
      },
    },
    {
      key: 'status' as keyof TicketRecord,
      header: 'Status',
      render: (row: TicketRecord) => {
        const variants: Record<string, 'secondary' | 'success' | 'outline'> = {
          OPEN: 'secondary',
          Open: 'secondary',
          RESOLVED: 'success',
          Resolved: 'success',
          CLOSED: 'outline',
          Closed: 'outline',
        };
        return <Badge variant={variants[row.status] || 'secondary'}>{row.status}</Badge>;
      },
    },
    { key: 'updatedAt' as keyof TicketRecord, header: 'Last Update' },
    {
      key: 'rawId' as keyof TicketRecord,
      header: 'Action',
      render: (row: TicketRecord) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedTicketId(row.rawId)}
        >
          View Ticket
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
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
            <h1 className="text-2xl font-bold tracking-tight">Support & Helpdesk</h1>
          </div>
          <p className="text-sm text-slate-500">
            File support tickets, review resolution notes, and communicate with engineering.
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
              File New Ticket
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

      {/* Conditional Rendering: Ticket Detail View vs Main Dashboard */}
      {selectedTicketId ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket Information Sidebar Card */}
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
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {isLoadingDetail ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : ticketDetail ? (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-secondary" /> Status
                      </span>
                      <Badge
                        variant={
                          ticketDetail.status === 'RESOLVED'
                            ? 'success'
                            : ticketDetail.status === 'CLOSED'
                            ? 'outline'
                            : 'secondary'
                        }
                      >
                        {ticketDetail.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 font-semibold uppercase">Priority</span>
                      <Badge
                        variant={
                          ticketDetail.priority === 'HIGH' || ticketDetail.priority === 'CRITICAL'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {ticketDetail.priority}
                      </Badge>
                    </div>

                    {ticketDetail.project && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-accent" /> Project
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {ticketDetail.project.name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Submitted
                      </span>
                      <span>{new Date(ticketDetail.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Initial Request Details
                    </h4>
                    <p className="p-3 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {ticketDetail.description}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">No ticket details available.</p>
              )}
            </CardContent>
          </Card>

          {/* Ticket Conversation Box */}
          <div className="lg:col-span-8">
            <TicketConversation
              comments={ticketDetail?.comments || []}
              isLoading={isLoadingDetail}
              error={detailError}
              onSendReply={handleSendReply}
              allowInternalNotes={false}
              onRetry={() => fetchTicketDetail(selectedTicketId)}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Collapsible File Support Ticket Form */}
          {(showCreateModal || tickets.length === 0) && (
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>File Support Ticket</CardTitle>
                <CardDescription>File requests straight to the dev ops queue.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Ticket Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />

                  {projects.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Associated Project (Optional)
                      </label>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                      >
                        <option value="">General Client Organization Support</option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.name} ({proj.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <TextArea
                    label="Error Description / Trace Logs"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Ticket Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      <option value="High">High (Service Disruption)</option>
                      <option value="Medium">Medium (General Bug/Config)</option>
                      <option value="Low">Low (Inquiry/Request)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {tickets.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        disabled={isSubmitting}
                        className="w-1/3 justify-center"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isSubmitting}
                      className="flex-1 justify-center"
                    >
                      {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tickets Directory Table */}
          <Card className={showCreateModal || tickets.length === 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <CardHeader>
              <CardTitle>Support Logs</CardTitle>
              <CardDescription>Active and historical ticket resolutions.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={displayData}
                  searchKey="subject"
                  rowsPerPage={5}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientSupport;
