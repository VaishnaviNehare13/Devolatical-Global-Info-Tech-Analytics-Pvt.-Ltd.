import { ClientStatus } from '@prisma/client';

export interface CreateClientServiceInput {
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
  accountManagerId?: string | null;
}

export interface UpdateClientServiceInput {
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
}

export interface FindClientsServiceOptions {
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
