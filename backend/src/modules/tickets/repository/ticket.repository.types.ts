import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

export interface CreateTicketRepositoryInput {
  subject: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  createdById?: string | null;
}

export interface UpdateTicketRepositoryInput {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  updatedById?: string | null;
  deletedAt?: Date | null;
}

export interface TicketBaseOutput {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedToId: string | null;
  clientId: string | null;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDetailOutput extends TicketBaseOutput {
  description: string;
  createdById: string | null;
  updatedById: string | null;
  deletedAt: Date | null;
}

export interface TicketCommentOutput {
  id: string;
  ticketId: string;
  userId: string;
  user?: {
    id: string;
    displayName: string;
    email: string;
  };
  message: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindTicketsRepositoryOptions {
  pagination?: {
    page: number;
    limit: number;
  };
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string;
  clientId?: string;
  projectId?: string;
  includeDeleted?: boolean;
  sortField?: 'subject' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TicketFiltersInput {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string;
  clientId?: string;
  projectId?: string;
  includeDeleted?: boolean;
}

export interface PaginatedTicketsOutput {
  items: TicketBaseOutput[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryOptions {
  includeDeleted?: boolean;
}
