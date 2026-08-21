import type { BaseQueryParams } from './api';

export interface TicketUserRef {
  id: string;
  displayName: string;
  email: string;
}

export interface TicketClientRef {
  id: string;
  name: string;
  code: string;
}

export interface TicketProjectRef {
  id: string;
  name: string;
  code?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user?: TicketUserRef;
}

export interface TicketSummary {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category?: string;
  assignedToId: string | null;
  clientId: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: TicketUserRef | null;
  client?: TicketClientRef | null;
  project?: TicketProjectRef | null;
}

export interface TicketDetail extends TicketSummary {
  description: string;
  createdById?: string | null;
  createdBy?: TicketUserRef | null;
  updatedById?: string | null;
  updatedBy?: TicketUserRef | null;
  comments?: TicketComment[];
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: string;
  status?: string;
  category?: string;
  clientId?: string;
  projectId?: string;
  assignedToId?: string;
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  priority?: string;
  status?: string;
  category?: string;
  clientId?: string | null;
  projectId?: string | null;
  assignedToId?: string | null;
}

export interface FindTicketsQuery extends BaseQueryParams {
  status?: string;
  priority?: string;
  category?: string;
  clientId?: string;
  projectId?: string;
  assignedToId?: string;
  includeDeleted?: boolean;
}

