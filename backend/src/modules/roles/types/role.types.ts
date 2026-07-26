/**
 * Pure domain string union type representing the system classification of a role.
 */
import { PaginatedResult } from '../../../shared/types/pagination';

export type RoleType = 'SYSTEM' | 'CUSTOM';

export interface RoleSummary {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description: string | null;
  readonly type: RoleType;
  readonly priority: number;
  readonly isActive: boolean;
  readonly isDefault: boolean;
  readonly isSystem: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Lightweight permission identifier payload.
 */
export interface PermissionSummary {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export interface RoleDetails extends RoleSummary {
  readonly permissions: readonly PermissionSummary[];
}

export type RoleSortField = 'createdAt' | 'name' | 'code' | 'priority';

export interface FindRolesOptions {
  readonly pagination?: {
    readonly page?: number;
    readonly limit?: number;
  };
  readonly search?: string;
  readonly filters?: {
    readonly type?: RoleType;
    readonly isActive?: boolean;
    readonly includeDeleted?: boolean;
  };
  readonly sorting?: {
    readonly field: RoleSortField;
    readonly order: 'asc' | 'desc';
  };
}

export type PaginatedRoles = PaginatedResult<RoleSummary>;

export interface CreateRoleData {
  readonly name: string;
  readonly code: string;
  readonly description?: string | null;
  readonly priority?: number;
  readonly isDefault?: boolean;
}

export interface UpdateRoleData {
  readonly name?: string;
  readonly description?: string | null;
  readonly priority?: number;
  readonly isDefault?: boolean;
}
