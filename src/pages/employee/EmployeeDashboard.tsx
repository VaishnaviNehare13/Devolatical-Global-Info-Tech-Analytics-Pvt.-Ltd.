import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { tasksApi } from '../../api/tasks.api';
import { projectsApi } from '../../api/projects.api';
import type { TaskSummary } from '../../types/task';
import type { ProjectSummary } from '../../types/project';
import {
  CheckSquare,
  Briefcase,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FolderGit2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // Parallel fetch for tasks and projects
      const [tasksRes, projectsRes] = await Promise.allSettled([
        tasksApi.listTasks({ limit: 10, sortOrder: 'desc' }),
        projectsApi.listProjects({ limit: 5, sortOrder: 'desc' }),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data?.items) {
        setTasks(tasksRes.value.data.items);
      } else {
        setTasks([]);
      }

      if (projectsRes.status === 'fulfilled' && projectsRes.value?.data?.items) {
        setProjects(projectsRes.value.data.items);
      } else {
        setProjects([]);
      }
    } catch {
      setLoadError('Failed to fetch some workspace metrics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const userProfile = user && 'displayName' in user ? (user as { displayName?: string; firstName?: string; lastName?: string }) : null;
  const displayName =
    userProfile?.displayName ||
    (userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : '') ||
    user?.email ||
    'Employee';

  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'Completed').length;
  const todoCount = tasks.filter((t) => t.status === 'TODO' || t.status === 'Todo' || t.status === 'Backlog').length;


  return (
    <div className="space-y-8 text-left">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-secondary/15 filter blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[9px] font-mono tracking-wider uppercase py-0.5">
                <Sparkles className="h-3 w-3 mr-1 text-accent" />
                Technical Operations
              </Badge>
              <span className="text-xs text-slate-300 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Track assigned sprint deliverables, review active data engineering pipelines, and coordinate client deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="text-white border-white/20 hover:bg-white/10 dark:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/employee/tasks">
              <Button variant="secondary" size="sm">
                View My Tasks
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Error alert banner if any */}
      {loadError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-amber-800 dark:text-amber-200 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tasks.length}</h3>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {inProgressCount} in progress · {todoCount} pending
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</h3>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Assigned enterprise workstreams
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}</h3>
            )}
            <p className="text-xs text-green-500 mt-1">
              ✓ Verified technical deliveries
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace State</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
              <FolderGit2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Active</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Role: {user?.roles?.map((r) => (typeof r === 'string' ? r : r.name)).join(', ') || 'Employee'}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Priority Tasks & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Priority Tasks */}
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <CardTitle>My Priority Tasks</CardTitle>
              <CardDescription>Active work items assigned to your engineering queue.</CardDescription>
            </div>
            <Link to="/employee/tasks" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3.5 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckSquare className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No active tasks assigned yet
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When tasks are assigned by project leads, they will appear in your prioritized task queue.
                </p>
              </div>
            ) : (
              tasks.slice(0, 5).map((task) => {
                const priorityVariant =
                  task.priority === 'URGENT' || task.priority === 'HIGH'
                    ? 'danger'
                    : task.priority === 'MEDIUM'
                    ? 'warning'
                    : 'outline';

                const statusVariant =
                  task.status === 'COMPLETED'
                    ? 'success'
                    : task.status === 'IN_PROGRESS'
                    ? 'secondary'
                    : 'outline';

                return (
                  <div
                    key={task.id}
                    className="p-3.5 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 rounded-xl bg-white dark:bg-dark-card transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.code && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {task.code}
                          </span>
                        )}
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {task.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.estimatedHours && <span>Est: {task.estimatedHours}h</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge variant={priorityVariant} className="text-[10px]">
                        {task.priority}
                      </Badge>
                      <Badge variant={statusVariant} className="text-[10px]">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right Column: Active Projects & Deliverables */}
        <Card className="lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <CardTitle>Project Deliverables</CardTitle>
              <CardDescription>Active engagements and execution timelines.</CardDescription>
            </div>
            <Link to="/employee/projects" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : projects.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Briefcase className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No active project assignments
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Assigned client engagements and data pipeline projects will be tracked here.
                </p>
              </div>
            ) : (
              projects.slice(0, 4).map((project) => (
                <div
                  key={project.id}
                  className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-dark/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {project.name}
                    </h4>
                    <Badge variant="secondary" className="text-[10px]">
                      {project.status || 'Active'}
                    </Badge>
                  </div>
                  {project.client?.name && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Client: {project.client.name}
                    </p>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Sprint Progress</span>
                      <span>Phase Active</span>
                    </div>
                    <ProgressBar value={70} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
