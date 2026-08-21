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
import { projectsApi } from '../../api/projects.api';
import { milestonesApi } from '../../api/milestones.api';
import { clientsApi } from '../../api/clients.api';
import { usersApi } from '../../api/users.api';
import type { ClientSummary } from '../../types/client';
import type { UserSummary } from '../../types/user';
import type {
  ProjectSummary,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  FindProjectsQuery,
} from '../../types/project';
import type {
  MilestoneSummary,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
} from '../../types/milestone';
import { ApiError } from '../../types/api';
import {
  FolderGit2,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  AlertCircle,
  Building2,
  UserCheck,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminProjects: React.FC = () => {
  const { showToast } = useToast();

  // Data States
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [clients, setClients] = useState<ClientSummary[]>([]);
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

  // Modal States - Project
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null);
  const [archivingProject, setArchivingProject] = useState<ProjectSummary | null>(null);
  const [restoringProject, setRestoringProject] = useState<ProjectSummary | null>(null);

  // Modal States - Milestones
  const [activeMilestoneProject, setActiveMilestoneProject] = useState<ProjectSummary | null>(null);
  const [milestones, setMilestones] = useState<MilestoneSummary[]>([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState<boolean>(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState<boolean>(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneSummary | null>(null);

  // Form States - Project
  const [projectForm, setProjectForm] = useState<CreateProjectRequest>({
    name: '',
    code: '',
    clientId: '',
    projectManagerId: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    budget: 0,
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form States - Milestone
  const [milestoneForm, setMilestoneForm] = useState<CreateMilestoneRequest>({
    title: '',
    description: '',
    status: 'IN_PROGRESS',
    dueDate: '',
  });
  const [milestoneFormError, setMilestoneFormError] = useState<string | null>(null);
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState<boolean>(false);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Reference Selectors (Clients & Users)
  useEffect(() => {
    const fetchSelectors = async () => {
      try {
        const [clientRes, userRes] = await Promise.all([
          clientsApi.listClients({ limit: 100 }),
          usersApi.getUsers({ limit: 100 }),
        ]);
        setClients(clientRes.data?.items || []);
        setStaffUsers(userRes.data?.items || []);
      } catch {
        // Non-blocking selector fetch error
      }
    };
    fetchSelectors();
  }, []);

  // Fetch Projects List
  const fetchProjects = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const queryParams: FindProjectsQuery = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          includeDeleted: includeDeleted || undefined,
          sortField: 'createdAt',
          sortOrder: 'desc',
        };

        const res = await projectsApi.listProjects(queryParams);
        const data = res.data;

        setProjects(data?.items || []);
        setTotalProjects(data?.total ?? data?.items?.length ?? 0);
      } catch (err: unknown) {
        const msg = ApiError.isApiError(err) ? err.message : 'Failed to load projects list from server.';
        setLoadError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, statusFilter, includeDeleted]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch Milestones for Selected Project
  const fetchMilestones = async (projectId: string) => {
    setIsLoadingMilestones(true);
    try {
      const res = await milestonesApi.listMilestones(projectId, { limit: 50, includeDeleted: true });
      setMilestones(res.data?.items || []);
    } catch {
      setMilestones([]);
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  const handleOpenMilestoneDrawer = (project: ProjectSummary) => {
    setActiveMilestoneProject(project);
    fetchMilestones(project.id);
  };

  // Open Create Project Modal
  const handleOpenCreateModal = () => {
    setProjectForm({
      name: '',
      code: '',
      clientId: clients[0]?.id || '',
      projectManagerId: staffUsers[0]?.id || '',
      status: 'ACTIVE',
      startDate: '',
      endDate: '',
      budget: 0,
      description: '',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Create Project Submit
  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name.trim() || !projectForm.code.trim() || !projectForm.clientId) {
      setFormError('Project Name, Code, and Client selection are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await projectsApi.createProject({
        name: projectForm.name.trim(),
        code: projectForm.code.trim().toUpperCase(),
        clientId: projectForm.clientId,
        projectManagerId: projectForm.projectManagerId || undefined,
        status: projectForm.status,
        startDate: projectForm.startDate ? new Date(projectForm.startDate).toISOString() : undefined,
        endDate: projectForm.endDate ? new Date(projectForm.endDate).toISOString() : undefined,
        budget: Number(projectForm.budget) || undefined,
        description: projectForm.description?.trim() || undefined,
      });

      showToast('Enterprise project profile created successfully.', 'success');
      setIsCreateModalOpen(false);
      await fetchProjects();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to create project.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Project Modal
  const handleOpenEditModal = (project: ProjectSummary) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      code: project.code,
      clientId: project.clientId,
      projectManagerId: project.projectManagerId || '',
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      budget: project.budget || 0,
      description: (project as ProjectDetail).description || '',
    });
    setFormError(null);
  };

  // Update Project Submit
  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    if (!projectForm.name.trim() || !projectForm.code.trim()) {
      setFormError('Project Name and Code are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const updateData: UpdateProjectRequest = {
        name: projectForm.name.trim(),
        code: projectForm.code.trim().toUpperCase(),
        clientId: projectForm.clientId,
        projectManagerId: projectForm.projectManagerId || null,
        status: projectForm.status,
        startDate: projectForm.startDate ? new Date(projectForm.startDate).toISOString() : null,
        endDate: projectForm.endDate ? new Date(projectForm.endDate).toISOString() : null,
        budget: Number(projectForm.budget) || null,
        description: projectForm.description?.trim() || undefined,
      };

      await projectsApi.updateProject(editingProject.id, updateData);
      showToast('Project details updated successfully.', 'success');
      setEditingProject(null);
      await fetchProjects();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to update project.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Archive Project
  const handleArchiveProject = async () => {
    if (!archivingProject) return;
    setIsSubmitting(true);
    try {
      await projectsApi.archiveProject(archivingProject.id);
      showToast(`Project "${archivingProject.name}" archived successfully.`, 'success');
      setArchivingProject(null);
      await fetchProjects();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to archive project.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restore Project
  const handleRestoreProject = async () => {
    if (!restoringProject) return;
    setIsSubmitting(true);
    try {
      await projectsApi.restoreProject(restoringProject.id);
      showToast(`Project "${restoringProject.name}" restored successfully.`, 'success');
      setRestoringProject(null);
      await fetchProjects();
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to restore project.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Create/Edit Milestone Modal
  const handleOpenCreateMilestone = () => {
    setEditingMilestone(null);
    setMilestoneForm({
      title: '',
      description: '',
      status: 'IN_PROGRESS',
      dueDate: '',
    });
    setMilestoneFormError(null);
    setIsMilestoneModalOpen(true);
  };

  const handleOpenEditMilestone = (m: MilestoneSummary) => {
    setEditingMilestone(m);
    setMilestoneForm({
      title: m.title,
      description: (m as MilestoneSummary & { description?: string }).description || '',
      status: m.status,
      dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split('T')[0] : '',
    });
    setMilestoneFormError(null);
    setIsMilestoneModalOpen(true);
  };

  // Submit Create/Edit Milestone
  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMilestoneProject) return;

    if (!milestoneForm.title.trim()) {
      setMilestoneFormError('Milestone title is required.');
      return;
    }

    setIsSubmittingMilestone(true);
    setMilestoneFormError(null);

    try {
      if (editingMilestone) {
        const updateData: UpdateMilestoneRequest = {
          title: milestoneForm.title.trim(),
          description: milestoneForm.description?.trim() || undefined,
          status: milestoneForm.status,
          dueDate: milestoneForm.dueDate ? new Date(milestoneForm.dueDate).toISOString() : null,
        };
        await milestonesApi.updateMilestone(activeMilestoneProject.id, editingMilestone.id, updateData);
        showToast('Milestone updated successfully.', 'success');
      } else {
        const createData: CreateMilestoneRequest = {
          title: milestoneForm.title.trim(),
          description: milestoneForm.description?.trim() || undefined,
          status: milestoneForm.status,
          dueDate: milestoneForm.dueDate ? new Date(milestoneForm.dueDate).toISOString() : undefined,
        };
        await milestonesApi.createMilestone(activeMilestoneProject.id, createData);
        showToast('Milestone created successfully.', 'success');
      }

      setIsMilestoneModalOpen(false);
      await fetchMilestones(activeMilestoneProject.id);
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to save milestone.';
      setMilestoneFormError(msg);
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  // Archive Milestone
  const handleArchiveMilestone = async (m: MilestoneSummary) => {
    if (!activeMilestoneProject) return;
    try {
      await milestonesApi.archiveMilestone(activeMilestoneProject.id, m.id);
      showToast(`Milestone "${m.title}" archived.`, 'success');
      await fetchMilestones(activeMilestoneProject.id);
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to archive milestone.';
      showToast(msg, 'error');
    }
  };

  // Restore Milestone
  const handleRestoreMilestone = async (m: MilestoneSummary) => {
    if (!activeMilestoneProject) return;
    try {
      await milestonesApi.restoreMilestone(activeMilestoneProject.id, m.id);
      showToast(`Milestone "${m.title}" restored.`, 'success');
      await fetchMilestones(activeMilestoneProject.id);
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to restore milestone.';
      showToast(msg, 'error');
    }
  };

  // Calculated Stats
  const activeCount = projects.filter((p) => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  const statusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
      case 'PLANNING':
        return 'secondary';
      case 'ON_HOLD':
      case 'CANCELLED':
        return 'danger';
      default:
        return 'outline';
    }
  };

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

  // Table Columns
  const columns = [
    {
      key: 'code' as keyof ProjectSummary,
      header: 'Code / Name',
      render: (p: ProjectSummary) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
              {p.code}
            </span>
            {p.deletedAt && (
              <Badge variant="danger" className="text-[9px]">Archived</Badge>
            )}
          </div>
          <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[200px]">
            {p.name}
          </span>
        </div>
      ),
    },
    {
      key: 'client' as keyof ProjectSummary,
      header: 'Client Org',
      render: (p: ProjectSummary) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate max-w-[140px]">{p.client?.name || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'projectManager' as keyof ProjectSummary,
      header: 'Project Manager',
      render: (p: ProjectSummary) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <UserCheck className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate max-w-[140px]">{p.projectManager?.displayName || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'status' as keyof ProjectSummary,
      header: 'Status',
      render: (p: ProjectSummary) => (
        <Badge variant={statusVariant(p.status)}>{p.status || 'Active'}</Badge>
      ),
    },
    {
      key: 'budget' as keyof ProjectSummary,
      header: 'Budget',
      render: (p: ProjectSummary) => (
        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
          {p.budget ? `$${p.budget.toLocaleString()}` : 'N/A'}
        </span>
      ),
    },
    {
      key: 'startDate' as keyof ProjectSummary,
      header: 'Timeline',
      render: (p: ProjectSummary) => (
        <span className="font-mono text-[11px] text-slate-500">
          {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions' as keyof ProjectSummary,
      header: 'Actions',
      render: (p: ProjectSummary) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-secondary hover:bg-secondary/10"
            onClick={() => handleOpenMilestoneDrawer(p)}
          >
            <Layers className="h-3.5 w-3.5 mr-1" /> Milestones
          </Button>

          {!p.deletedAt ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleOpenEditModal(p)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-danger hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => setArchivingProject(p)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px] text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              onClick={() => setRestoringProject(p)}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Enterprise Projects Management</h1>
          <p className="text-sm text-slate-500">
            Create, configure, and manage enterprise client engagements, project managers, budgets, and milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchProjects(true)} disabled={isLoading || isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-1.5" /> New Project
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Total Projects</span>
            <FolderGit2 className="h-4 w-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalProjects}</div>
          <div className="text-[10px] text-slate-400">Registered engagements</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Active Engagements</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <div className="text-[10px] text-slate-400">In execution / active</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Completed Projects</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}</div>
          <div className="text-[10px] text-slate-400">Signed off engagements</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Total Budget Value</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            ${totalBudget.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Active portfolio budget</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name or code..."
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
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="PLANNING">PLANNING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <Checkbox
              id="includeDeletedProjects"
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
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Unable to load project registry</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchProjects(false)}>
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
            <CardTitle>Project Directory</CardTitle>
            <CardDescription>Enterprise engagements, milestone delivery, and budget allocations.</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <DataTable columns={columns} data={projects} rowsPerPage={pageSize} />
            ) : (
              <div className="py-12 text-center space-y-2">
                <FolderGit2 className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No project records found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No enterprise projects match your current search query or status filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Enterprise Project">
        <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-left text-xs">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Project Name <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="e.g. Delta Lakehouse Pipeline"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Project Code <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="e.g. PRJ-LAKE-01"
                value={projectForm.code}
                onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Client Organization <span className="text-danger">*</span>
              </label>
              <select
                value={projectForm.clientId}
                onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
                required
              >
                <option value="">Select Client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Project Manager</label>
              <select
                value={projectForm.projectManagerId || ''}
                onChange={(e) => setProjectForm({ ...projectForm, projectManagerId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="">Select Manager...</option>
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Status</label>
              <select
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="PLANNING">PLANNING</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Budget ($ USD)</label>
              <Input
                type="number"
                placeholder="50000"
                value={projectForm.budget || ''}
                onChange={(e) => setProjectForm({ ...projectForm, budget: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Start Date</label>
              <Input
                type="date"
                value={projectForm.startDate || ''}
                onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">Scope Description</label>
            <TextArea
              rows={3}
              placeholder="Detailed technical deliverable scope and SLAs..."
              value={projectForm.description || ''}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={!!editingProject} onClose={() => setEditingProject(null)} title="Edit Project Profile">
        <form onSubmit={handleUpdateProjectSubmit} className="space-y-4 text-left text-xs">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Project Name <span className="text-danger">*</span>
              </label>
              <Input
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Project Code <span className="text-danger">*</span>
              </label>
              <Input
                value={projectForm.code}
                onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Client Organization</label>
              <select
                value={projectForm.clientId}
                onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="">Select Client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Project Manager</label>
              <select
                value={projectForm.projectManagerId || ''}
                onChange={(e) => setProjectForm({ ...projectForm, projectManagerId: e.target.value })}
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
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Status</label>
              <select
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="PLANNING">PLANNING</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Budget ($ USD)</label>
              <Input
                type="number"
                value={projectForm.budget || ''}
                onChange={(e) => setProjectForm({ ...projectForm, budget: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Start Date</label>
              <Input
                type="date"
                value={projectForm.startDate || ''}
                onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">Scope Description</label>
            <TextArea
              rows={3}
              value={projectForm.description || ''}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setEditingProject(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Archive Project Confirmation */}
      <Modal isOpen={!!archivingProject} onClose={() => setArchivingProject(null)} title="Archive Project Profile">
        {archivingProject && (
          <div className="space-y-4 text-left text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Archive Enterprise Project</span>
                <span>
                  Are you sure you want to archive project <strong>{archivingProject.name}</strong> ({archivingProject.code})? It can be restored later using the archived toggle.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setArchivingProject(null)}>
                Cancel
              </Button>
              <Button variant="secondary" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleArchiveProject} disabled={isSubmitting}>
                {isSubmitting ? 'Archiving...' : 'Archive Project'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Restore Project Confirmation */}
      <Modal isOpen={!!restoringProject} onClose={() => setRestoringProject(null)} title="Restore Project Profile">
        {restoringProject && (
          <div className="space-y-4 text-left text-xs">
            <p>
              Restore project <strong>{restoringProject.name}</strong> back to active registry?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setRestoringProject(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleRestoreProject} disabled={isSubmitting}>
                {isSubmitting ? 'Restoring...' : 'Restore Project'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Milestones Management Modal */}
      <Modal
        isOpen={!!activeMilestoneProject}
        onClose={() => {
          setActiveMilestoneProject(null);
          setMilestones([]);
        }}
        title={`Milestones — ${activeMilestoneProject?.name || ''}`}
      >
        {activeMilestoneProject && (
          <div className="space-y-4 text-left text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                  {activeMilestoneProject.code}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{activeMilestoneProject.name}</h4>
              </div>
              <Button variant="primary" size="sm" className="text-xs" onClick={handleOpenCreateMilestone}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Milestone
              </Button>
            </div>

            {isLoadingMilestones ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : milestones.length > 0 ? (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 dark:bg-dark rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">{m.title}</h5>
                          {m.deletedAt && <Badge variant="danger" className="text-[9px]">Archived</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>Status: {m.status}</span>
                          {m.dueDate && <span>• Due: {new Date(m.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={reviewBadgeVariant(m.reviewStatus)}>
                          {m.reviewStatus || 'NOT_SUBMITTED'}
                        </Badge>

                        {!m.deletedAt ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-slate-500"
                              onClick={() => handleOpenEditMilestone(m)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-danger"
                              onClick={() => handleArchiveMilestone(m)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[9px] text-emerald-600 border-emerald-300"
                            onClick={() => handleRestoreMilestone(m)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> Restore
                          </Button>
                        )}
                      </div>
                    </div>

                    {m.reviewStatus === 'REVISION_REQUESTED' && m.revisionNotes && (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-900 dark:text-amber-200 italic">
                        Revision Notes: {m.revisionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 font-mono text-xs">
                No milestones currently registered for this project.
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create / Edit Milestone Modal */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title={editingMilestone ? 'Edit Milestone' : 'Add Project Milestone'}
      >
        <form onSubmit={handleMilestoneSubmit} className="space-y-4 text-left text-xs">
          {milestoneFormError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {milestoneFormError}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Milestone Title <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="e.g. Phase 1: Core Architecture & ETL"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Status</label>
              <select
                value={milestoneForm.status}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="PLANNED">PLANNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Due Date</label>
              <Input
                type="date"
                value={milestoneForm.dueDate || ''}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">Milestone Description</label>
            <TextArea
              rows={3}
              placeholder="Specific technical deliverable requirements..."
              value={milestoneForm.description || ''}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsMilestoneModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmittingMilestone}>
              {isSubmittingMilestone ? 'Saving...' : editingMilestone ? 'Update Milestone' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProjects;
