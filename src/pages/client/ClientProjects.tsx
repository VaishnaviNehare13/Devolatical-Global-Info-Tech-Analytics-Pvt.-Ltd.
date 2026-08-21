import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TextArea } from '../../components/ui/TextArea';
import { Skeleton } from '../../components/ui/Skeleton';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import { clientPortalApi, type ClientProjectItem, type ClientProjectMilestoneItem } from '../../api/client-portal.api';
import { ApiError } from '../../types/api';
import { RefreshCw, FolderGit2, AlertCircle, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';

interface TaskRecord {
  id: string;
  name: string;
  category: string;
  status: string;
  assignee: string;
  dueDate: string;
}

export const ClientProjects: React.FC = () => {
  const { showToast } = useToast();

  const [projects, setProjects] = useState<ClientProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Milestone Action States
  const [approvingMilestoneId, setApprovingMilestoneId] = useState<string | null>(null);
  const [revisionModalMilestone, setRevisionModalMilestone] = useState<ClientProjectMilestoneItem | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<string>('');
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [isSubmittingRevision, setIsSubmittingRevision] = useState<boolean>(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientPortalApi.getProjects();
      if (res.data) {
        setProjects(res.data);
      }
    } catch {
      setError('Failed to fetch client projects from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleApprove = async (milestoneId: string) => {
    setApprovingMilestoneId(milestoneId);
    try {
      await clientPortalApi.approveMilestone(milestoneId);
      showToast('Milestone deliverable approved successfully!', 'success');
      await fetchProjects();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to approve milestone deliverable.';
      showToast(msg, 'error');
    } finally {
      setApprovingMilestoneId(null);
    }
  };

  const handleOpenRevisionModal = (milestone: ClientProjectMilestoneItem) => {
    setRevisionModalMilestone(milestone);
    setRevisionNotes('');
    setRevisionError(null);
  };

  const handleCloseRevisionModal = () => {
    setRevisionModalMilestone(null);
    setRevisionNotes('');
    setRevisionError(null);
  };

  const handleSubmitRevision = async () => {
    const trimmed = revisionNotes.trim();
    if (trimmed.length < 5) {
      setRevisionError('Please provide detailed feedback for the revision request (at least 5 characters).');
      return;
    }

    if (!revisionModalMilestone) return;

    setIsSubmittingRevision(true);
    setRevisionError(null);
    try {
      await clientPortalApi.requestMilestoneRevision(revisionModalMilestone.id, trimmed);
      showToast('Revision request submitted to engineering team.', 'success');
      handleCloseRevisionModal();
      await fetchProjects();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to submit revision request.';
      setRevisionError(msg);
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  // Flatten task items across active projects for sprint task board
  const taskRows: TaskRecord[] = projects.flatMap((p) =>
    (p.tasks || []).map((t) => ({
      id: t.id,
      name: t.title,
      category: p.name,
      status: t.status,
      assignee: 'DevOps Lead',
      dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Active',
    }))
  );

  const columns = [
    { key: 'name' as keyof TaskRecord, header: 'Task Name' },
    { key: 'category' as keyof TaskRecord, header: 'Project Engagement' },
    {
      key: 'status' as keyof TaskRecord,
      header: 'Status',
      render: (row: TaskRecord) => {
        const variants: Record<string, 'success' | 'secondary' | 'outline' | 'warning'> = {
          COMPLETED: 'success',
          Completed: 'success',
          IN_PROGRESS: 'secondary',
          'In Progress': 'secondary',
          TODO: 'outline',
          Backlog: 'outline',
        };
        return <Badge variant={variants[row.status] || 'secondary'}>{row.status}</Badge>;
      },
    },
    { key: 'assignee' as keyof TaskRecord, header: 'Lead Engineer' },
    { key: 'dueDate' as keyof TaskRecord, header: 'Due Date' },
  ];

  const reviewBadgeVariant = (reviewStatus?: string) => {
    switch (reviewStatus?.toUpperCase()) {
      case 'APPROVED':
        return 'success';
      case 'SUBMITTED':
        return 'secondary';
      case 'REVISION_REQUESTED':
        return 'warning';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Active Project Boards</h1>
          <p className="text-sm text-slate-500">
            Monitor granular implementation progress, review deliverable milestones, and sign off on project phases.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProjects} disabled={isLoading}>
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
          <Button variant="ghost" size="sm" onClick={fetchProjects}>
            Retry
          </Button>
        </div>
      )}

      {/* Projects Cards List with Interactive Milestone Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))
        ) : projects.length > 0 ? (
          projects.map((proj) => (
            <Card key={proj.id} className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                      {proj.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{proj.name}</h3>
                  </div>
                  <Badge variant={proj.status === 'ACTIVE' ? 'success' : 'secondary'}>{proj.status}</Badge>
                </div>

                {/* Milestone Deliverables Review Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Project Deliverables & Milestones</span>
                    <span>{(proj.milestones || []).length} Phases</span>
                  </div>

                  {proj.milestones && proj.milestones.length > 0 ? (
                    <div className="space-y-2">
                      {proj.milestones.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-xs text-slate-900 dark:text-white block">{m.title}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                <span>Status: {m.status}</span>
                                {m.submittedForReviewAt && (
                                  <span>• Submitted: {new Date(m.submittedForReviewAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <Badge variant={reviewBadgeVariant(m.reviewStatus)}>
                              {m.reviewStatus || 'NOT_SUBMITTED'}
                            </Badge>
                          </div>

                          {/* Client Actions when SUBMITTED */}
                          {m.reviewStatus === 'SUBMITTED' && (
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-800">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-[10px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={approvingMilestoneId === m.id}
                                onClick={() => handleApprove(m.id)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {approvingMilestoneId === m.id ? 'Approving...' : 'Approve Deliverable'}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-7 px-2.5 text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                onClick={() => handleOpenRevisionModal(m)}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Request Revision
                              </Button>
                            </div>
                          )}

                          {/* Display Notes for Revision Requested */}
                          {m.reviewStatus === 'REVISION_REQUESTED' && m.revisionNotes && (
                            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-900 dark:text-amber-200">
                              <span className="font-semibold block">Revision Notes Submitted:</span>
                              <p className="italic">{m.revisionNotes}</p>
                            </div>
                          )}

                          {/* Display Approved Confirmation */}
                          {m.reviewStatus === 'APPROVED' && (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Approved {m.approvedAt ? `on ${new Date(m.approvedAt).toLocaleDateString()}` : ''}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic p-2 font-mono">
                      No deliverables currently undergoing client review.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center space-y-2 col-span-2">
            <FolderGit2 className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No projects currently registered</p>
          </Card>
        )}
      </div>

      {/* Request Revision Modal */}
      <Modal
        isOpen={!!revisionModalMilestone}
        onClose={handleCloseRevisionModal}
        title="Request Deliverable Revision"
      >
        {revisionModalMilestone && (
          <div className="space-y-4 text-left text-sm">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Deliverable Revision Request</span>
                <span>
                  Please describe the changes or optimizations needed for milestone <strong>{revisionModalMilestone.title}</strong>. Your feedback will notify the engineering team.
                </span>
              </div>
            </div>

            {revisionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-xs">
                {revisionError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Revision Notes & Required Changes <span className="text-danger">*</span>
              </label>
              <TextArea
                rows={4}
                placeholder="Describe specific queries, edge cases, or optimizations required..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400">Minimum 5 characters required.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={handleCloseRevisionModal} disabled={isSubmittingRevision}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleSubmitRevision}
                disabled={isSubmittingRevision || revisionNotes.trim().length < 5}
              >
                {isSubmittingRevision ? 'Submitting Request...' : 'Submit Revision Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Sprint Task Backlog</CardTitle>
          <CardDescription>Track status, assignees, and deadlines for active enterprise sprints.</CardDescription>
        </CardHeader>
        <CardContent>
          {taskRows.length > 0 ? (
            <DataTable columns={columns} data={taskRows} searchKey="name" rowsPerPage={5} />
          ) : (
            <div className="py-8 text-center space-y-1 text-slate-400 text-xs font-mono">
              <span>No active sprint tasks currently attached to your projects.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default ClientProjects;
