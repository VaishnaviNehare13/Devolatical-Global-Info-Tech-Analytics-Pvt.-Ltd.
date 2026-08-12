import { TaskStatus, TaskPriority, Prisma } from '@prisma/client';

export interface CreateTaskServiceInput {
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
}

export interface UpdateTaskServiceInput {
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
}

export interface FindTasksServiceOptions {
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
