import { PaginatedResult } from '../../../shared/types/pagination';

export interface RoleSummaryPayload {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export interface PermissionSummaryPayload {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export interface MappingDetails {
  readonly id: string;
  readonly roleId: string;
  readonly permissionId: string;
  readonly isGranted: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly role?: RoleSummaryPayload;
  readonly permission?: PermissionSummaryPayload;
}

export type RolePermissionSortField = 'createdAt' | 'roleId' | 'permissionId';

export interface FindMappingsOptions {
  readonly pagination?: {
    readonly page?: number;
    readonly limit?: number;
  };
  readonly search?: string;
  readonly filters?: {
    readonly roleId?: string;
    readonly permissionId?: string;
    readonly isGranted?: boolean;
    readonly includeDeleted?: boolean;
  };
  readonly sorting?: {
    readonly field: RolePermissionSortField;
    readonly order: 'asc' | 'desc';
  };
}

export type PaginatedMappings = PaginatedResult<MappingDetails>;
