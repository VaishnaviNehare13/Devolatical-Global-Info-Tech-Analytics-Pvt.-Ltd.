import { ClientStatus } from '@prisma/client';

export interface CreateClientRepositoryInput {
  name: string;
  code: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  status?: ClientStatus;
  accountManagerId?: string | null;
  createdById?: string | null;
}

export interface UpdateClientRepositoryInput {
  name?: string;
  code?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  status?: ClientStatus;
  accountManagerId?: string | null;
  updatedById?: string | null;
  deletedAt?: Date | null;
}

export interface ClientBaseOutput {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  createdAt: Date;
}

export interface ClientDetailOutput extends ClientBaseOutput {
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  notes: string | null;
  accountManagerId: string | null;
  createdById: string | null;
  updatedAt: Date;
  updatedById: string | null;
  deletedAt: Date | null;
}

export interface FindClientsRepositoryOptions {
  pagination?: {
    page: number;
    limit: number;
  };
  search?: string;
  status?: ClientStatus;
  accountManagerId?: string;
  includeDeleted?: boolean;
  sortField?: 'name' | 'code' | 'status' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ClientFiltersInput {
  search?: string;
  status?: ClientStatus;
  accountManagerId?: string;
  includeDeleted?: boolean;
}

export interface PaginatedClientsOutput {
  items: ClientBaseOutput[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryOptions {
  includeDeleted?: boolean;
}
