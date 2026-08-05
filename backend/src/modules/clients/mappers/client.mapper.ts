import {
  ClientBaseOutput,
  ClientDetailOutput,
  PaginatedClientsOutput,
} from '../repository/client.repository.types';

export interface ClientSummaryResponse {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
}

export interface ClientDetailResponse extends ClientSummaryResponse {
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  notes: string | null;
  accountManagerId: string | null;
  updatedAt: string;
}

export interface PaginatedClientsResponse {
  items: ClientSummaryResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Pure Mapper responsible for transforming Clients service outputs into API response structures.
 * Contains no business logic or framework-specific objects.
 */
export class ClientMapper {
  /**
   * Transforms a base client summary output into a presentation-safe response model.
   */
  public static toSummaryResponse(client: ClientBaseOutput): ClientSummaryResponse {
    return {
      id: client.id,
      name: client.name,
      code: client.code,
      email: client.email,
      phone: client.phone,
      status: client.status,
      createdAt: client.createdAt.toISOString(),
    };
  }

  /**
   * Transforms a detailed client output into a presentation-safe response model.
   * Excludes internal database properties (like deletedAt, createdById, updatedById).
   */
  public static toDetailResponse(client: ClientDetailOutput): ClientDetailResponse {
    return {
      id: client.id,
      name: client.name,
      code: client.code,
      email: client.email,
      phone: client.phone,
      status: client.status,
      createdAt: client.createdAt.toISOString(),
      website: client.website,
      addressLine1: client.addressLine1,
      addressLine2: client.addressLine2,
      city: client.city,
      state: client.state,
      country: client.country,
      postalCode: client.postalCode,
      notes: client.notes,
      accountManagerId: client.accountManagerId,
      updatedAt: client.updatedAt.toISOString(),
    };
  }

  /**
   * Transforms a paginated client list output into a presentation-safe response model.
   */
  public static toPaginatedResponse(paginated: PaginatedClientsOutput): PaginatedClientsResponse {
    return {
      items: paginated.items.map((item) => this.toSummaryResponse(item)),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
    };
  }
}
