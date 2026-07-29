import { Prisma, AuditModule, AuditAction, AuditStatus, AuditSeverity } from '@prisma/client';
import { AUDIT_LOG_SELECT } from './audit-log.repository.select';

export { AuditModule, AuditAction, AuditStatus, AuditSeverity };

/**
 * Strongly typed return structure from the repository, matching the centralized select projection.
 */
export type AuditLogOutput = Prisma.AuditLogGetPayload<{
  select: typeof AUDIT_LOG_SELECT;
}>;

/**
 * Payload interface for creating a new Audit Log entry.
 */
export interface CreateAuditLogData {
  readonly userId?: string | null;
  readonly requestId?: string | null;
  readonly module: AuditModule;
  readonly action: AuditAction;
  readonly entityType?: string | null;
  readonly entityId?: string | null;
  readonly resourceName?: string | null;
  readonly oldValues?: Prisma.InputJsonValue | null;
  readonly newValues?: Prisma.InputJsonValue | null;
  readonly metadata?: Prisma.InputJsonValue | null;
  readonly status: AuditStatus;
  readonly severity?: AuditSeverity;
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
}

/**
 * Query filters supported by the audit logs repository.
 */
export interface FindAuditLogsFilters {
  readonly module?: AuditModule;
  readonly action?: AuditAction;
  readonly severity?: AuditSeverity;
  readonly status?: AuditStatus;
  readonly userId?: string;
  readonly requestId?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly resourceName?: string;
  readonly dateFrom?: Date | string;
  readonly dateTo?: Date | string;
}

/**
 * Allowed fields for sorting audit logs.
 */
export type AuditLogSortField = 'createdAt' | 'severity' | 'module' | 'action';

/**
 * Allowed sort directions.
 */
export type AuditLogSortOrder = 'asc' | 'desc';

/**
 * Request options for retrieving paginated and sorted audit logs.
 */
export interface FindAuditLogsOptions {
  readonly pagination?: {
    readonly page?: number;
    readonly limit?: number;
  };
  readonly search?: string;
  readonly filters?: FindAuditLogsFilters;
  readonly sorting?: {
    readonly field?: AuditLogSortField;
    readonly order?: AuditLogSortOrder;
  };
}

/**
 * Simple payload returned by findMany containing elements and total count.
 */
export interface RawPaginatedAuditLogs {
  readonly items: readonly AuditLogOutput[];
  readonly total: number;
}
