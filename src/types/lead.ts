import type { BaseQueryParams } from './api';

export interface LeadSummary {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  priority: string;
  source: string | null;
  createdAt: string;
}

export interface LeadDetail extends LeadSummary {
  industry: string | null;
  notes: string | null;
  assignedToId: string | null;
  updatedAt: string;
}

export interface CreateLeadRequest {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  status?: string;
  priority?: string;
  source?: string;
  industry?: string;
  notes?: string;
  assignedToId?: string;
}

export interface UpdateLeadRequest {
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  status?: string;
  priority?: string;
  source?: string;
  industry?: string;
  notes?: string;
  assignedToId?: string | null;
}

export interface FindLeadsQuery extends BaseQueryParams {
  status?: string;
  priority?: string;
  source?: string;
  assignedToId?: string;
}
