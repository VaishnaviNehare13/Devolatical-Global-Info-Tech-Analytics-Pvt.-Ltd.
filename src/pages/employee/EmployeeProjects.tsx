import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { projectsApi } from '../../api/projects.api';
import type { ProjectSummary, ProjectDetail, FindProjectsQuery } from '../../types/project';
import { ApiError } from '../../types/api';
import {
  Search,
  RefreshCw,
  Eye,
  Calendar,
  AlertCircle,
  FolderGit2,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const EmployeeProjects: React.FC = () => {
  const { showToast } = useToast();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Project Detail Modal
  const [detailProject, setDetailProject] = useState<ProjectDetail | ProjectSummary | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
          status: statusFilter || undefined,
          sortField: 'createdAt',
          sortOrder: 'desc',
        };

        const res = await projectsApi.listProjects(queryParams);
        const data = res.data;


        setProjects(data?.items || []);
        setTotalCount(data?.total ?? data?.items?.length ?? 0);
        setTotalPages(data?.pages ?? Math.ceil((data?.total ?? 1) / pageSize) ?? 1);
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch projects from server.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, statusFilter, showToast]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenDetail = async (project: ProjectSummary) => {
    setDetailProject(project);
    try {
      const res = await projectsApi.getProjectById(project.id);
      if (res.data) {
        setDetailProject(res.data);
      }
    } catch {
      // Keep summary if detail route requires elevated admin permissions
    }
  };


  const statusBadgeVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'success';
      case 'PLANNING':
        return 'secondary';
      case 'ON_HOLD':
        return 'warning';
      case 'COMPLETED':
        return 'outline';
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
            <h1 className="text-2xl font-bold tracking-tight">Active Projects & Engagements</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} Total
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Enterprise client projects, data lakehouse implementations, and cloud delivery workstreams.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchProjects(true)}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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

          <div className="flex items-center gap-3">
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
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="PLANNING">PLANNING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      {loadError && (
        <Card className="p-8 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Unable to load projects
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchProjects(false)}>
            Retry Request
          </Button>
        </Card>
      )}

      {isLoading && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full mt-4" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !loadError && (
        <>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  hoverEffect
                  className="flex flex-col justify-between p-6 space-y-4 cursor-pointer"
                  onClick={() => handleOpenDetail(project)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                          {project.code || 'PROJ'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {project.name}
                        </h3>
                      </div>
                      <Badge variant={statusBadgeVariant(project.status)}>
                        {project.status || 'Active'}
                      </Badge>
                    </div>

                    {project.client?.name && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{project.client.name}</span>
                      </div>
                    )}

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Milestone Progress</span>
                        <span>Phase Active</span>
                      </div>
                      <ProgressBar value={65} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="h-3.5 w-3.5" />
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Active'}
                    </span>
                    <Button variant="ghost" size="sm" className="text-secondary p-1 h-auto text-xs">
                      Inspect <Eye className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center space-y-2">
              <FolderGit2 className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                No active projects found
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No enterprise projects match your current filter settings or are currently assigned.
              </p>
            </Card>
          )}

          {totalPages > 1 && (
            <div className="p-4 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {currentPage} of {totalPages} ({totalCount} items)
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

      {/* Project Detail Modal */}
      <Modal
        isOpen={!!detailProject}
        onClose={() => setDetailProject(null)}
        title={detailProject?.name || 'Project Overview'}
      >
        {detailProject && (
          <div className="space-y-5 text-left text-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                  {detailProject.code}
                </span>
                <Badge variant={statusBadgeVariant(detailProject.status)}>
                  {detailProject.status || 'Active'}
                </Badge>
              </div>
              {detailProject.client?.name && (
                <span className="text-xs font-semibold text-slate-500">
                  {detailProject.client.name}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Project Scope & Deliverables
              </label>
              <div className="p-3.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {(detailProject as ProjectDetail).description || 'Enterprise analytics and cloud deployment engagement managed under Devolatical Global standards.'}
              </div>
            </div>

            {/* Metadata Information */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Start Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {detailProject.startDate ? new Date(detailProject.startDate).toLocaleDateString() : 'Active'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Target End Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {detailProject.endDate ? new Date(detailProject.endDate).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>
            </div>

            {/* Execution Phasing */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Deliverable Phasing
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-dark rounded-lg">
                  <span className="font-semibold">Phase 1: Architecture & ETL Pipeline Setup</span>
                  <Badge variant="success" className="text-[9px]">Completed</Badge>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-dark rounded-lg">
                  <span className="font-semibold">Phase 2: Data Ingestion & Transformation</span>
                  <Badge variant="secondary" className="text-[9px]">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-dark rounded-lg">
                  <span className="font-semibold">Phase 3: Analytics Dashboard & Client Sign-off</span>
                  <Badge variant="outline" className="text-[9px]">Scheduled</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeProjects;
