import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { tasksApi } from '../../api/tasks.api';
import { projectsApi } from '../../api/projects.api';
import { usersApi } from '../../api/users.api';
import type { TaskSummary, TaskDetail, FindTasksQuery } from '../../types/task';
import type { ProjectSummary } from '../../types/project';
import type { UserSummary } from '../../types/user';
import { ApiError } from '../../types/api';
import {
  CheckSquare,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  User,
  FolderKanban,
  Clock,
} from 'lucide-react';

export const EmployeeTasks: React.FC = () => {
  const { showToast } = useToast();

  // Task List & Pagination State
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Related Entity Lists for Dropdowns
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);

  // Task Details Modal State
  const [detailTask, setDetailTask] = useState<TaskDetail | TaskSummary | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createCode, setCreateCode] = useState<string>('');
  const [createTitle, setCreateTitle] = useState<string>('');
  const [createProjectId, setCreateProjectId] = useState<string>('');
  const [createAssigneeId, setCreateAssigneeId] = useState<string>('');
  const [createPriority, setCreatePriority] = useState<string>('MEDIUM');
  const [createStatus, setCreateStatus] = useState<string>('TODO');
  const [createEstimatedHours, setCreateEstimatedHours] = useState<string>('');
  const [createDueDate, setCreateDueDate] = useState<string>('');
  const [createDescription, setCreateDescription] = useState<string>('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  // Edit Task & Log Work Hours Modal State
  const [editingTask, setEditingTask] = useState<TaskDetail | TaskSummary | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');
  const [editProjectId, setEditProjectId] = useState<string>('');
  const [editAssigneeId, setEditAssigneeId] = useState<string>('');
  const [editPriority, setEditPriority] = useState<string>('MEDIUM');
  const [editStatus, setEditStatus] = useState<string>('TODO');
  const [editEstimatedHours, setEditEstimatedHours] = useState<string>('');
  const [editLoggedHours, setEditLoggedHours] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Archive Task Confirmation Modal State
  const [archivingTask, setArchivingTask] = useState<TaskSummary | null>(null);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);

  // Restore Action State
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Projects and Users selector options
  const fetchOptions = useCallback(async () => {
    try {
      const projRes = await projectsApi.listProjects({ limit: 100 });
      setProjects(projRes.data?.items || []);
    } catch {
      setProjects([]);
    }
    try {
      const userRes = await usersApi.getUsers({ limit: 100 });
      setUsers(userRes.data?.items || []);
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Fetch Tasks List
  const fetchTasks = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const queryParams: FindTasksQuery = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          projectId: projectFilter || undefined,
          assignedToId: assigneeFilter || undefined,
          includeDeleted: showArchived || undefined,
          sortField: 'createdAt',
          sortOrder: 'desc',
        };

        const res = await tasksApi.listTasks(queryParams);
        const data = res.data;

        setTasks(data?.items || []);
        setTotalCount(data?.total ?? data?.items?.length ?? 0);
        setTotalPages(data?.pages ?? Math.ceil((data?.total ?? 1) / pageSize) ?? 1);
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch task list from server.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      currentPage,
      pageSize,
      debouncedSearch,
      statusFilter,
      priorityFilter,
      projectFilter,
      assigneeFilter,
      showArchived,
      showToast,
    ]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Open Detail Inspect Modal
  const handleOpenDetail = async (task: TaskSummary) => {
    setDetailTask(task);
    try {
      const res = await tasksApi.getTaskById(task.id);
      if (res.data) {
        setDetailTask(res.data);
      }
    } catch {
      // Fallback to task summary if detail call restricted
    }
  };

  // Fast Workflow Status Update
  const handleUpdateTaskStatus = async (newStatus: string) => {
    if (!detailTask) return;
    setIsUpdatingStatus(true);
    try {
      await tasksApi.updateTask(detailTask.id, { status: newStatus });
      showToast(`Task status updated to ${newStatus}.`, 'success');
      setDetailTask((prev) => (prev ? { ...prev, status: newStatus } : null));
      await fetchTasks(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update task status.';
      showToast(message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Create Modal & Pre-generate Task Code
  const handleOpenCreateModal = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const dateCode = new Date().toISOString().slice(2, 7).replace('-', '');
    setCreateCode(`TSK-${dateCode}-${randomSuffix}`);
    setCreateTitle('');
    setCreateProjectId(projects[0]?.id || '');
    setCreateAssigneeId('');
    setCreatePriority('MEDIUM');
    setCreateStatus('TODO');
    setCreateEstimatedHours('');
    setCreateDueDate('');
    setCreateDescription('');
    setIsCreateModalOpen(true);
  };

  // Submit Create Task
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createCode.trim() || !createProjectId) {
      showToast('Please specify task title, task code, and associated project.', 'error');
      return;
    }

    const estHours = createEstimatedHours ? parseFloat(createEstimatedHours) : undefined;
    if (estHours !== undefined && (isNaN(estHours) || estHours < 0)) {
      showToast('Estimated hours must be a positive number.', 'error');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await tasksApi.createTask({
        code: createCode.trim(),
        title: createTitle.trim(),
        projectId: createProjectId,
        assignedToId: createAssigneeId || undefined,
        priority: createPriority,
        status: createStatus,
        estimatedHours: estHours,
        dueDate: createDueDate || undefined,
        description: createDescription.trim() || undefined,
      });

      showToast(`Task ${createCode} created successfully.`, 'success');
      setIsCreateModalOpen(false);
      await fetchTasks(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to create task.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit & Log Hours Modal
  const handleOpenEditModal = async (task: TaskSummary) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCode(task.code);
    setEditProjectId(task.projectId || '');
    setEditAssigneeId(task.assignedToId || '');
    setEditPriority(task.priority || 'MEDIUM');
    setEditStatus(task.status || 'TODO');
    setEditEstimatedHours(task.estimatedHours ? String(task.estimatedHours) : '');
    setEditLoggedHours(task.loggedHours !== undefined ? String(task.loggedHours) : '0');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
    setEditDescription('');

    try {
      const detailRes = await tasksApi.getTaskById(task.id);
      if (detailRes.data) {
        setEditingTask(detailRes.data);
        setEditDescription(detailRes.data.description || '');
      }
    } catch {
      // Keep basic summary
    }
  };

  // Submit Edit Task & Log Work Hours
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const estHours = editEstimatedHours ? parseFloat(editEstimatedHours) : undefined;
    const logHours = editLoggedHours ? parseFloat(editLoggedHours) : undefined;

    if (estHours !== undefined && (isNaN(estHours) || estHours < 0)) {
      showToast('Estimated hours must be positive.', 'error');
      return;
    }
    if (logHours !== undefined && (isNaN(logHours) || logHours < 0)) {
      showToast('Logged hours must be non-negative.', 'error');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await tasksApi.updateTask(editingTask.id, {
        title: editTitle.trim() || undefined,
        code: editCode.trim() || undefined,
        projectId: editProjectId || undefined,
        assignedToId: editAssigneeId || undefined,
        priority: editPriority,
        status: editStatus,
        estimatedHours: estHours,
        loggedHours: logHours,
        dueDate: editDueDate || undefined,
        description: editDescription.trim() || undefined,
      });

      showToast(`Task ${editCode || editingTask.code} updated successfully.`, 'success');
      setEditingTask(null);
      await fetchTasks(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update task details.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Confirm Archive (Soft Delete) Task
  const handleArchiveConfirm = async () => {
    if (!archivingTask) return;

    setIsArchiving(true);
    try {
      await tasksApi.archiveTask(archivingTask.id);
      showToast(`Task ${archivingTask.code} archived successfully.`, 'success');
      setArchivingTask(null);
      await fetchTasks(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to archive task.';
      showToast(message, 'error');
    } finally {
      setIsArchiving(false);
    }
  };

  // Restore Archived Task
  const handleRestoreTask = async (task: TaskSummary) => {
    setRestoringId(task.id);
    try {
      await tasksApi.restoreTask(task.id);
      showToast(`Task ${task.code} restored to active status.`, 'success');
      await fetchTasks(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to restore task.';
      showToast(message, 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const priorityBadgeVariant = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'success';
      case 'REVIEW':
      case 'IN_PROGRESS':
        return 'warning';
      case 'TODO':
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Engineering Task Workspace</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} Active & Archived Items
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Track engineering backlog deliverables, manage sprint workflow statuses, assign team members, and log work hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTasks(true)}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-1" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by task title, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="REVIEW">REVIEW</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName || u.email}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <Checkbox
                id="showArchivedTasks"
                checked={showArchived}
                onChange={(e) => {
                  setShowArchived(e.target.checked);
                  setCurrentPage(1);
                }}
              />
              <label htmlFor="showArchivedTasks" className="text-xs text-slate-500 cursor-pointer select-none">
                Show Archived
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tasks Table Card */}
      <Card className="p-0 overflow-hidden">
        {loadError && (
          <div className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20">
            <AlertCircle className="h-8 w-8 text-danger mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Unable to load tasks from server
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchTasks(false)}>
              Retry Request
            </Button>
          </div>
        )}

        {isLoading && !loadError && (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-1/3" />
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
                      Task Code & Title
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Project & Assignee
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Priority & Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Hours (Logged/Est)
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Due Date
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {tasks.length > 0 ? (
                    tasks.map((task) => {
                      const projectName = task.project?.name || projects.find((p) => p.id === task.projectId)?.name;
                      const assigneeUser = task.assignedTo || users.find((u) => u.id === task.assignedToId);
                      const assigneeName = assigneeUser?.displayName || (assigneeUser?.firstName ? `${assigneeUser.firstName} ${assigneeUser.lastName || ''}` : assigneeUser?.email);
                      const isArchived = !!task.deletedAt;

                      return (
                        <tr
                          key={task.id}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors ${
                            isArchived ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {task.code && (
                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                                  {task.code}
                                </span>
                              )}
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {task.title}
                              </span>
                              {isArchived && (
                                <Badge variant="outline" className="text-[9px] text-amber-500 border-amber-300">
                                  ARCHIVED
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              {projectName ? (
                                <span className="inline-flex items-center text-xs font-semibold text-secondary">
                                  <FolderKanban className="h-3 w-3 mr-1" />
                                  {projectName}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                              {assigneeName && (
                                <span className="inline-flex items-center text-[11px] text-slate-500 dark:text-slate-400">
                                  <User className="h-3 w-3 mr-1 text-slate-400" />
                                  {assigneeName}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <Badge variant={priorityBadgeVariant(task.priority)} className="text-[10px]">
                                {task.priority || 'MEDIUM'}
                              </Badge>
                              <Badge variant={statusBadgeVariant(task.status)} className="text-[10px]">
                                {task.status || 'TODO'}
                              </Badge>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>
                                {task.loggedHours || 0} / {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDetail(task)}
                                className="p-1.5"
                                title="Inspect Task Details"
                              >
                                <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                              </Button>

                              {!isArchived ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenEditModal(task)}
                                    className="p-1.5"
                                    title="Edit Task & Log Hours"
                                  >
                                    <Pencil className="h-4 w-4 text-slate-400 hover:text-secondary" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setArchivingTask(task)}
                                    className="p-1.5 hover:text-red-500"
                                    title="Archive Task"
                                  >
                                    <Archive className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestoreTask(task)}
                                  disabled={restoringId === task.id}
                                  className="h-7 text-xs px-2"
                                  title="Restore Task"
                                >
                                  <RotateCcw className={`h-3 w-3 mr-1 ${restoringId === task.id ? 'animate-spin' : ''}`} />
                                  Restore
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center space-y-2">
                        <CheckSquare className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          No tasks match current filter criteria
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Try resetting your search query or status filter to see all assigned engineering work items.
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
                  Showing page {currentPage} of {totalPages} ({totalCount} total items)
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

      {/* Task Details & Fast Workflow Update Modal */}
      <Modal
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        title={detailTask?.title || 'Task Details'}
      >
        {detailTask && (
          <div className="space-y-5 text-left text-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {detailTask.code && (
                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                    {detailTask.code}
                  </span>
                )}
                <Badge variant={priorityBadgeVariant(detailTask.priority)}>
                  Priority: {detailTask.priority}
                </Badge>
              </div>
              <Badge variant={statusBadgeVariant(detailTask.status)}>
                {detailTask.status}
              </Badge>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Description / Technical Scope
              </label>
              <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {(detailTask as TaskDetail).description || 'No detailed technical specification attached to this task.'}
              </div>
            </div>

            {/* Metadata Fields Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Hours Logged / Est</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {detailTask.loggedHours || 0} / {detailTask.estimatedHours ? `${detailTask.estimatedHours} hrs` : 'Unassigned'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Due Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {detailTask.dueDate ? new Date(detailTask.dueDate).toLocaleDateString() : 'No deadline'}
                </span>
              </div>
            </div>

            {/* Fast Status Update Actions */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Update Workflow Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((st) => (
                  <Button
                    key={st}
                    size="sm"
                    variant={detailTask.status === st ? 'secondary' : 'outline'}
                    disabled={detailTask.status === st || isUpdatingStatus}
                    onClick={() => handleUpdateTaskStatus(st)}
                    className="text-[11px] py-1.5 justify-center"
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Engineering Work Task"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Task Code *"
              value={createCode}
              onChange={(e) => setCreateCode(e.target.value)}
              placeholder="e.g. TSK-2608-101"
              required
              disabled={isSubmittingCreate}
              className="col-span-1"
            />
            <Input
              label="Task Title *"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="Specify task headline..."
              required
              disabled={isSubmittingCreate}
              className="col-span-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Associated Project *
            </label>
            <select
              value={createProjectId}
              onChange={(e) => setCreateProjectId(e.target.value)}
              required
              disabled={isSubmittingCreate}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">Select Project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Assignee Team Member (Optional)
            </label>
            <select
              value={createAssigneeId}
              onChange={(e) => setCreateAssigneeId(e.target.value)}
              disabled={isSubmittingCreate}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName || u.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={createPriority}
                onChange={(e) => setCreatePriority(e.target.value)}
                disabled={isSubmittingCreate}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Workflow Status
              </label>
              <select
                value={createStatus}
                onChange={(e) => setCreateStatus(e.target.value)}
                disabled={isSubmittingCreate}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="REVIEW">REVIEW</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimated Hours"
              type="number"
              step="0.5"
              value={createEstimatedHours}
              onChange={(e) => setCreateEstimatedHours(e.target.value)}
              placeholder="e.g. 8.0"
              disabled={isSubmittingCreate}
            />

            <Input
              label="Due Date"
              type="date"
              value={createDueDate}
              onChange={(e) => setCreateDueDate(e.target.value)}
              disabled={isSubmittingCreate}
            />
          </div>

          <TextArea
            label="Technical Description / Requirements (Optional)"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            placeholder="Detailed scope, acceptance criteria, or engineering instructions..."
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
              {isSubmittingCreate ? 'Creating Task...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Task & Log Work Hours Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title={`Edit Task ${editingTask?.code}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
          <Input
            label="Task Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            disabled={isSubmittingEdit}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Associated Project
            </label>
            <select
              value={editProjectId}
              onChange={(e) => setEditProjectId(e.target.value)}
              disabled={isSubmittingEdit}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">Select Project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Assignee Team Member
            </label>
            <select
              value={editAssigneeId}
              onChange={(e) => setEditAssigneeId(e.target.value)}
              disabled={isSubmittingEdit}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName || u.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                disabled={isSubmittingEdit}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Workflow Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                disabled={isSubmittingEdit}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="REVIEW">REVIEW</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/80 dark:border-slate-800">
            <Input
              label="Estimated Hours"
              type="number"
              step="0.5"
              value={editEstimatedHours}
              onChange={(e) => setEditEstimatedHours(e.target.value)}
              placeholder="0.0"
              disabled={isSubmittingEdit}
            />

            <Input
              label="Actual Hours Logged"
              type="number"
              step="0.5"
              value={editLoggedHours}
              onChange={(e) => setEditLoggedHours(e.target.value)}
              placeholder="0.0"
              disabled={isSubmittingEdit}
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            disabled={isSubmittingEdit}
          />

          <TextArea
            label="Technical Scope / Notes"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Technical details or progress notes..."
            disabled={isSubmittingEdit}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingTask(null)}
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

      {/* Archive Task Confirmation Modal */}
      <Modal
        isOpen={!!archivingTask}
        onClose={() => setArchivingTask(null)}
        title="Archive Task Statement"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
            <div className="text-xs space-y-1">
              <h5 className="font-semibold text-sm">Confirm Task Archival</h5>
              <p>
                Are you sure you want to archive task{' '}
                <span className="font-mono font-bold">{archivingTask?.code}</span> ({archivingTask?.title})?
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Archived tasks are hidden from default views but can be restored at any time.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setArchivingTask(null)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleArchiveConfirm}
              disabled={isArchiving}
            >
              {isArchiving ? 'Archiving...' : 'Archive Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeTasks;
