import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

interface TaskRecord {
  id: string;
  name: string;
  category: string;
  status: 'Completed' | 'In Progress' | 'Backlog';
  assignee: string;
  dueDate: string;
}

export const ClientProjects: React.FC = () => {
  const columns = [
    { key: 'name' as keyof TaskRecord, header: 'Task Name' },
    { key: 'category' as keyof TaskRecord, header: 'Category' },
    {
      key: 'status' as keyof TaskRecord,
      header: 'Status',
      render: (row: TaskRecord) => {
        const variants = {
          Completed: 'success' as const,
          'In Progress': 'secondary' as const,
          Backlog: 'outline' as const
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    },
    { key: 'assignee' as keyof TaskRecord, header: 'Lead Engineer' },
    { key: 'dueDate' as keyof TaskRecord, header: 'Due Date' }
  ];

  const data: TaskRecord[] = [
    { id: '1', name: 'Establish AWS Direct Connect tunnel', category: 'Infrastructure', status: 'Completed', assignee: 'Alex Rivera', dueDate: '2026-05-12' },
    { id: '2', name: 'Integrate Snowflake OAuth validation parameters', category: 'Security', status: 'Completed', assignee: 'Sarah Jenkins', dueDate: '2026-06-01' },
    { id: '3', name: 'Build ingestion schema migrations pipeline', category: 'Data Science', status: 'In Progress', assignee: 'Vikram Mehta', dueDate: '2026-07-20' },
    { id: '4', name: 'Develop analytics metrics API routes', category: 'Software Dev', status: 'In Progress', assignee: 'Jane Doe', dueDate: '2026-08-05' },
    { id: '5', name: 'Conduct penetration testing auditing', category: 'Security', status: 'Backlog', assignee: 'Mark Vance', dueDate: '2026-09-15' },
    { id: '6', name: 'Prepare client dashboard staging portal', category: 'Frontend', status: 'Backlog', assignee: 'Alex Rivera', dueDate: '2026-10-01' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Active Project Boards</h1>
        <p className="text-sm text-slate-500">
          Monitor granular implementation progress and technical task boards assigned to Devolatical Global teams.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sprint Task backlog</CardTitle>
          <CardDescription>Track status, assignees, and deadlines for active enterprise sprints.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} searchKey="name" rowsPerPage={5} />
        </CardContent>
      </Card>
    </div>
  );
};
export default ClientProjects;
