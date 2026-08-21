import type { BaseQueryParams } from './api';

export interface ClientSummary {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  status: string;
  accountManagerId?: string | null;
  accountManager?: { id: string; displayName: string; email: string } | null;
  deletedAt?: string | null;
  createdAt: string;
}

export interface ClientDetail extends ClientSummary {
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  notes: string | null;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  accountManagerId?: string;
  status?: string;
}

export interface UpdateClientRequest {
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  accountManagerId?: string | null;
  status?: string;
}

export interface FindClientsQuery extends BaseQueryParams {
  status?: string;
  code?: string;
  accountManagerId?: string;
  includeDeleted?: boolean;
}
