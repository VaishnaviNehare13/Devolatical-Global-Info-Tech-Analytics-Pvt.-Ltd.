import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { DataTable } from '../../components/ui/DataTable';
import { clientPortalApi, type ClientProjectItem } from '../../api/client-portal.api';
import { RefreshCw, FolderGit2, AlertCircle } from 'lucide-react';

interface TaskRecord {
  id: string;
  name: string;
  category: string;
  status: string;
  assignee: string;
  dueDate: string;
}

export const ClientProjects: React.FC = () => {
  const [projects, setProjects] = useState<ClientProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fallback sample records if no tasks attached yet
  const displayTasks: TaskRecord[] = taskRows.length > 0 ? taskRows : [
    { id: '1', name: 'Establish AWS Direct Connect tunnel', category: 'Infrastructure', status: 'COMPLETED', assignee: 'Alex Rivera', dueDate: '2026-05-12' },
    { id: '2', name: 'Integrate Snowflake OAuth validation parameters', category: 'Security', status: 'COMPLETED', assignee: 'Sarah Jenkins', dueDate: '2026-06-01' },
    { id: '3', name: 'Build ingestion schema migrations pipeline', category: 'Data Science', status: 'IN_PROGRESS', assignee: 'Vikram Mehta', dueDate: '2026-07-20' },
    { id: '4', name: 'Develop analytics metrics API routes', category: 'Software Dev', status: 'IN_PROGRESS', assignee: 'Jane Doe', dueDate: '2026-08-05' },
  ];

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

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Active Project Boards</h1>
          <p className="text-sm text-slate-500">
            Monitor granular implementation progress and technical task boards assigned to Devolatical Global teams.
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

      {/* Projects Cards List */}
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
            <Card key={proj.id} className="p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                    {proj.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{proj.name}</h3>
                </div>
                <Badge variant={proj.status === 'ACTIVE' ? 'success' : 'secondary'}>{proj.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Milestones: {(proj.milestones || []).length} active phases registered.
              </p>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center space-y-2 col-span-2">
            <FolderGit2 className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No projects currently registered</p>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sprint Task Backlog</CardTitle>
          <CardDescription>Track status, assignees, and deadlines for active enterprise sprints.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={displayTasks} searchKey="name" rowsPerPage={5} />
        </CardContent>
      </Card>
    </div>
  );
};
export default ClientProjects;
