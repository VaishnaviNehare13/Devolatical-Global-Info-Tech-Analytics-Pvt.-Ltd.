import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

export interface CreateTicketServiceInput {
  subject: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
}

export interface UpdateTicketServiceInput {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
}

export interface FindTicketsServiceOptions {
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
