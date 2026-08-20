import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { tasksApi } from '../../api/tasks.api';
import type { TaskSummary, TaskDetail, FindTasksQuery } from '../../types/task';
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
} from 'lucide-react';

export const EmployeeTasks: React.FC = () => {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Task Details Modal
  const [detailTask, setDetailTask] = useState<TaskDetail | TaskSummary | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);


  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
          : 'Failed to fetch tasks from server.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, statusFilter, priorityFilter, showToast]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenDetail = async (task: TaskSummary) => {
    setDetailTask(task);
    try {
      const res = await tasksApi.getTaskById(task.id);
      if (res.data) {
        setDetailTask(res.data);
      }
    } catch {
      // Fallback to task summary if detail call is restricted
    }
  };


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
      case 'IN_PROGRESS':
        return 'secondary';
      case 'REVIEW':
        return 'warning';
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
            <h1 className="text-2xl font-bold tracking-tight">Assigned Tasks Directory</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} Total
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Sprint work items, technical deliverables, and active engineering tasks assigned to you.
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
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by task title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
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

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
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
          </div>
        </div>
      </Card>

      {/* Main Table / Content Card */}
      <Card className="p-0 overflow-hidden">
        {/* Error State */}
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

        {/* Loading State */}
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

        {/* Loaded Data Table */}
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
                      Priority
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
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
                    tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {task.code && (
                              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {task.code}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {task.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={priorityBadgeVariant(task.priority)} className="text-[10px]">
                            {task.priority || 'MEDIUM'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusBadgeVariant(task.status)} className="text-[10px]">
                            {task.status || 'TODO'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(task)}
                            className="p-1.5"
                            aria-label="Inspect Task"
                          >
                            <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center space-y-2">
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

      {/* Task Details & Status Update Modal */}
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
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Estimated Hours</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {detailTask.estimatedHours ? `${detailTask.estimatedHours} hrs` : 'Unassigned'}
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
    </div>
  );
};

export default EmployeeTasks;
