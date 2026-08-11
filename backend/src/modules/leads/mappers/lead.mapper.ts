import {
  LeadBaseOutput,
  LeadDetailOutput,
  PaginatedLeadsOutput,
} from '../repository/lead.repository.types';

export interface LeadSummaryResponse {
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

export interface LeadDetailResponse extends LeadSummaryResponse {
  industry: string | null;
  notes: string | null;
  assignedToId: string | null;
  updatedAt: string;
}

export interface PaginatedLeadsResponse {
  items: LeadSummaryResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Pure Mapper responsible for transforming Leads service outputs into API response structures.
 * Contains no business logic or framework-specific objects.
 */
export class LeadMapper {
  /**
   * Transforms a base lead summary output into a presentation-safe response model.
   */
  public static toSummaryResponse(lead: LeadBaseOutput): LeadSummaryResponse {
    return {
      id: lead.id,
      name: lead.name,
      companyName: lead.companyName,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      priority: lead.priority,
      source: lead.source,
      createdAt: lead.createdAt.toISOString(),
    };
  }

  /**
   * Transforms a detailed lead output into a presentation-safe response model.
   * Excludes internal database properties (like deletedAt, createdById, updatedById).
   */
  public static toDetailResponse(lead: LeadDetailOutput): LeadDetailResponse {
    return {
      id: lead.id,
      name: lead.name,
      companyName: lead.companyName,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      priority: lead.priority,
      source: lead.source,
      createdAt: lead.createdAt.toISOString(),
      industry: lead.industry,
      notes: lead.notes,
      assignedToId: lead.assignedToId,
      updatedAt: lead.updatedAt.toISOString(),
    };
  }

  /**
   * Transforms a paginated lead list output into a presentation-safe response model.
   */
  public static toPaginatedResponse(paginated: PaginatedLeadsOutput): PaginatedLeadsResponse {
    return {
      items: paginated.items.map((item) => this.toSummaryResponse(item)),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
    };
  }
}
