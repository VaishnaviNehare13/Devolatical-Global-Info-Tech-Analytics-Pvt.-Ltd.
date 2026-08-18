import type { BaseQueryParams } from './api';

export interface AuditLogUser {
  id: string;
  displayName: string;
  email: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  requestId: string | null;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  resourceName: string | null;
  oldValues: unknown | null;
  newValues: unknown | null;
  metadata: unknown | null;
  status: string;
  severity: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: AuditLogUser | null;
}

export interface FindAuditLogsQuery extends BaseQueryParams {
  module?: string;
  action?: string;
  status?: string;
  severity?: string;
  userId?: string;
  requestId?: string;
  entityType?: string;
  entityId?: string;
  resourceName?: string;
  dateFrom?: string;
  dateTo?: string;
}
