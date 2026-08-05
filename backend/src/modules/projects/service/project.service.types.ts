import { ProjectStatus, Prisma } from '@prisma/client';

export interface CreateProjectServiceInput {
  name: string;
  code: string;
  description?: string | null;
  clientId: string;
  projectManagerId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: Prisma.Decimal | null;
}

export interface UpdateProjectServiceInput {
  name?: string;
  code?: string;
  description?: string | null;
  status?: ProjectStatus;
  clientId?: string;
  projectManagerId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: Prisma.Decimal | null;
}

export interface FindProjectsServiceOptions {
  pagination?: {
    page: number;
    limit: number;
  };
  search?: string;
  status?: ProjectStatus;
  clientId?: string;
  projectManagerId?: string;
  includeDeleted?: boolean;
  sortField?:
    'name' | 'code' | 'status' | 'budget' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
