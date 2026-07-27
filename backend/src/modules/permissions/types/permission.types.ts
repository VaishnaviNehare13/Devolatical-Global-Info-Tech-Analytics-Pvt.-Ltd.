import { PaginatedResult } from '../../../shared/types/pagination';

export type PermissionModule =
  | 'IDENTITY'
  | 'CRM'
  | 'PROJECT'
  | 'SUPPORT'
  | 'FINANCE'
  | 'CAREER'
  | 'CMS'
  | 'ANALYTICS'
  | 'NOTIFICATION'
  | 'SYSTEM';

export type PermissionResource =
  | 'USER'
  | 'ROLE'
  | 'PERMISSION'
  | 'PROJECT'
  | 'TASK'
  | 'CLIENT'
  | 'EMPLOYEE'
  | 'JOB'
  | 'APPLICATION'
  | 'REPORT'
  | 'INVOICE'
  | 'PAYMENT'
  | 'DASHBOARD';

export type PermissionAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'ASSIGN'
  | 'EXPORT'
  | 'IMPORT'
  | 'DOWNLOAD'
  | 'PUBLISH';

export interface PermissionSummary {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description: string | null;
  readonly module: PermissionModule;
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
  readonly isActive: boolean;
  readonly isSystem: boolean;
  readonly displayOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RoleSummaryPayload {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export interface PermissionDetails extends PermissionSummary {
  readonly roles: readonly RoleSummaryPayload[];
}

export type PermissionSortField = 'createdAt' | 'name' | 'code' | 'displayOrder';

export interface FindPermissionsOptions {
  readonly pagination?: {
    readonly page?: number;
    readonly limit?: number;
  };
  readonly search?: string;
  readonly filters?: {
    readonly module?: PermissionModule;
    readonly resource?: PermissionResource;
    readonly action?: PermissionAction;
    readonly isActive?: boolean;
    readonly includeDeleted?: boolean;
  };
  readonly sorting?: {
    readonly field: PermissionSortField;
    readonly order: 'asc' | 'desc';
  };
}

export type PaginatedPermissions = PaginatedResult<PermissionSummary>;

export interface CreatePermissionData {
  readonly name: string;
  readonly code: string;
  readonly description?: string | null;
  readonly module: PermissionModule;
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
  readonly displayOrder?: number;
}

export interface UpdatePermissionData {
  readonly name?: string;
  readonly description?: string | null;
  readonly module?: PermissionModule;
  readonly resource?: PermissionResource;
  readonly action?: PermissionAction;
  readonly displayOrder?: number;
  readonly isActive?: boolean;
}
