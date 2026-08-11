import { TaskStatus, TaskPriority, Prisma } from '@prisma/client';

export interface CreateTaskRepositoryInput {
  code: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId: string;
  milestoneId?: string | null;
  assignedToId?: string | null;
  parentId?: string | null;
  estimatedHours?: Prisma.Decimal | null;
  loggedHours?: Prisma.Decimal;
  dueDate?: Date | null;
  createdById?: string | null;
}

export interface UpdateTaskRepositoryInput {
  code?: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  milestoneId?: string | null;
  assignedToId?: string | null;
  parentId?: string | null;
  estimatedHours?: Prisma.Decimal | null;
  loggedHours?: Prisma.Decimal;
  dueDate?: Date | null;
  updatedById?: string | null;
  deletedAt?: Date | null;
}

export interface TaskBaseOutput {
  id: string;
  code: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  milestoneId: string | null;
  assignedToId: string | null;
  parentId: string | null;
  estimatedHours: Prisma.Decimal | null;
  loggedHours: Prisma.Decimal;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDetailOutput extends TaskBaseOutput {
  description: string | null;
  createdById: string | null;
  updatedById: string | null;
  deletedAt: Date | null;
}

export interface FindTasksRepositoryOptions {
  pagination?: {
    page: number;
    limit: number;
  };
  search?: string;
  code?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  milestoneId?: string;
  assignedToId?: string;
  parentId?: string;
  includeDeleted?: boolean;
  sortField?:
    | 'code'
    | 'title'
    | 'status'
    | 'priority'
    | 'dueDate'
    | 'estimatedHours'
    | 'loggedHours'
    | 'createdAt'
    | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskFiltersInput {
  search?: string;
  code?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  milestoneId?: string;
  assignedToId?: string;
  parentId?: string;
  includeDeleted?: boolean;
}

export interface PaginatedTasksOutput {
  items: TaskBaseOutput[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryOptions {
  includeDeleted?: boolean;
}
