import type { BaseQueryParams } from './api';

export interface TaskSummary {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  projectId: string;
  milestoneId: string | null;
  assignedToId: string | null;
  parentId: string | null;
  estimatedHours: number | null;
  loggedHours: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  project?: { id: string; name: string; code: string };
  assignedTo?: { id: string; displayName?: string; firstName?: string; lastName?: string; email: string };
}

export interface TaskDetail extends TaskSummary {
  description: string | null;
}

export interface CreateTaskRequest {
  title: string;
  projectId: string;
  code?: string;
  description?: string;
  status?: string;
  priority?: string;
  milestoneId?: string;
  assignedToId?: string;
  parentId?: string;
  estimatedHours?: number;
  loggedHours?: number;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  code?: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  milestoneId?: string | null;
  assignedToId?: string | null;
  parentId?: string | null;
  estimatedHours?: number | null;
  loggedHours?: number;
  dueDate?: string | null;
}

export interface FindTasksQuery extends BaseQueryParams {
  code?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  milestoneId?: string;
  assignedToId?: string;
  parentId?: string;
  includeDeleted?: boolean;
}
