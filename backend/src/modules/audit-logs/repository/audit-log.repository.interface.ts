import {
  CreateAuditLogData,
  AuditLogOutput,
  FindAuditLogsOptions,
  RawPaginatedAuditLogs,
} from './audit-log.types';

/**
 * Audit Log Repository contract interface.
 * Defines query boundaries for managing audit trail logs.
 */
export interface IAuditLogRepository {
  /**
   * Creates a new audit log record.
   *
   * @param data Fields to create the audit log entry
   * @returns The created audit log output
   */
  create(data: CreateAuditLogData): Promise<AuditLogOutput>;

  /**
   * Retrieves an audit log record by its unique ID.
   *
   * @param id The unique audit log identifier
   * @returns AuditLogOutput object or null if not found
   */
  findById(id: string): Promise<AuditLogOutput | null>;

  /**
   * Finds, filters, and paginates audit logs.
   *
   * @param options Pagination, search, filtering, and sorting criteria
   * @returns Paginated list of AuditLogOutput objects along with total count
   */
  findMany(options: FindAuditLogsOptions): Promise<RawPaginatedAuditLogs>;
}
