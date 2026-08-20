import {
  TicketBaseOutput,
  TicketDetailOutput,
  PaginatedTicketsOutput,
} from '../repository/ticket.repository.types';

export interface TicketSummaryResponse {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  assignedToId: string | null;
  clientId: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetailResponse extends TicketSummaryResponse {
  description: string;
}

export interface PaginatedTicketsResponse {
  items: TicketSummaryResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Pure Mapper responsible for transforming Tickets service outputs into API response structures.
 * Contains no business logic, database queries, or framework-specific objects.
 */
export class TicketMapper {
  /**
   * Transforms a base ticket summary output into a presentation-safe response model.
   */
  public static toSummaryResponse(ticket: TicketBaseOutput): TicketSummaryResponse {
    return {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      assignedToId: ticket.assignedToId,
      clientId: ticket.clientId,
      projectId: ticket.projectId,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };
  }

  /**
   * Transforms a detailed ticket output into a presentation-safe response model.
   * Excludes internal database properties (like deletedAt, createdById, updatedById).
   */
  public static toDetailResponse(ticket: TicketDetailOutput): TicketDetailResponse {
    return {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      assignedToId: ticket.assignedToId,
      clientId: ticket.clientId,
      projectId: ticket.projectId,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      description: ticket.description,
    };
  }

  /**
   * Transforms a paginated ticket list output into a presentation-safe response model.
   */
  public static toPaginatedResponse(paginated: PaginatedTicketsOutput): PaginatedTicketsResponse {
    return {
      items: paginated.items.map((item) => this.toSummaryResponse(item)),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
    };
  }
}
