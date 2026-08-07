import { LeadStatus, LeadPriority, LeadSource } from '@prisma/client';

export interface CreateLeadRepositoryInput {
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource | null;
  industry?: string | null;
  notes?: string | null;
  assignedToId?: string | null;
  createdById?: string | null;
}

export interface UpdateLeadRepositoryInput {
  name?: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource | null;
  industry?: string | null;
  notes?: string | null;
  assignedToId?: string | null;
  updatedById?: string | null;
  deletedAt?: Date | null;
}

export interface LeadBaseOutput {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource | null;
  createdAt: Date;
}

export interface LeadDetailOutput extends LeadBaseOutput {
  industry: string | null;
  notes: string | null;
  assignedToId: string | null;
  createdById: string | null;
  updatedAt: Date;
  updatedById: string | null;
  deletedAt: Date | null;
}

export interface FindLeadsRepositoryOptions {
  pagination?: {
    page: number;
    limit: number;
  };
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  assignedToId?: string;
  includeDeleted?: boolean;
  sortField?: 'name' | 'companyName' | 'status' | 'priority' | 'source' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFiltersInput {
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  assignedToId?: string;
  includeDeleted?: boolean;
}

export interface PaginatedLeadsOutput {
  items: LeadBaseOutput[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryOptions {
  includeDeleted?: boolean;
}
