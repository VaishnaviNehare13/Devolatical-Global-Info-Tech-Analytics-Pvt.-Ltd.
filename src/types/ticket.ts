import type { BaseQueryParams } from './api';

export interface TicketSummary {
  id: string;
  subject: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  clientId: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetail extends TicketSummary {
  description: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: string;
  status?: string;
  clientId?: string;
  projectId?: string;
  assignedToId?: string;
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  priority?: string;
  status?: string;
  clientId?: string | null;
  projectId?: string | null;
  assignedToId?: string | null;
}

export interface FindTicketsQuery extends BaseQueryParams {
  status?: string;
  priority?: string;
  clientId?: string;
  projectId?: string;
  assignedToId?: string;
}
