import { LeadStatus, LeadPriority, LeadSource } from '@prisma/client';

export interface CreateLeadServiceInput {
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
}

export interface UpdateLeadServiceInput {
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
}

export interface FindLeadsServiceOptions {
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
