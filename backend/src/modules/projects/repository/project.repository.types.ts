import { ProjectStatus, Prisma } from '@prisma/client';

export interface CreateProjectRepositoryInput {
  name: string;
  code: string;
  description?: string | null;
  status?: ProjectStatus;
  clientId: string;
  projectManagerId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: Prisma.Decimal | null;
  createdById?: string | null;
}

export interface UpdateProjectRepositoryInput {
  name?: string;
  code?: string;
  description?: string | null;
  status?: ProjectStatus;
  clientId?: string;
  projectManagerId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: Prisma.Decimal | null;
  updatedById?: string | null;
  deletedAt?: Date | null;
}

export interface ProjectBaseOutput {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  clientId: string;
  projectManagerId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  budget: Prisma.Decimal | null;
  createdAt: Date;
}

export interface ProjectDetailOutput extends ProjectBaseOutput {
  description: string | null;
  createdById: string | null;
  updatedAt: Date;
  updatedById: string | null;
  deletedAt: Date | null;
}

export interface FindProjectsRepositoryOptions {
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

export interface ProjectFiltersInput {
  search?: string;
  status?: ProjectStatus;
  clientId?: string;
  projectManagerId?: string;
  includeDeleted?: boolean;
}

export interface PaginatedProjectsOutput {
  items: ProjectBaseOutput[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryOptions {
  includeDeleted?: boolean;
}
