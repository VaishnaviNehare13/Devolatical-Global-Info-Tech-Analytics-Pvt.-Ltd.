import { IAuditLogRepository } from '../repository/audit-log.repository.interface';
import {
  CreateAuditLogData,
  AuditLogOutput,
  FindAuditLogsOptions,
  AuditLogSortField,
  AuditLogSortOrder,
} from '../repository/audit-log.types';
import { RepositoryError } from '../repository/audit-log.errors';
import { AUDIT_LOG_PAGINATION, AUDIT_LOG_SORT } from '../constants/audit-log.constants';
import {
  AuditLogServiceError,
  AuditLogNotFoundError,
  AuditLogValidationError,
} from './audit-log.service.errors';

export interface PaginatedAuditLogs {
  readonly items: readonly AuditLogOutput[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };
}

/**
 * Service Layer implementation for logging and querying audit logs.
 * Coordinates audit-log repository and enforces domain rules.
 */
export class AuditLogService {
  constructor(private readonly repository: IAuditLogRepository) {}

  /**
   * Records a new audit log entry.
   *
   * NOTE: This is an INTERNAL application service called by other modules (Authentication, Users, etc.)
   * as a side-effect. It must NOT be exposed directly by a controller or public routing endpoint.
   *
   * @param data Payload to create the audit log entry
   * @returns The recorded audit log record
   * @throws {AuditLogServiceError} If repository database access fails
   */
  public async record(data: CreateAuditLogData): Promise<AuditLogOutput> {
    try {
      return await this.repository.create(data);
    } catch (error) {
      this.handleRepositoryError(error, 'Failed to write audit log entry.');
    }
  }

  /**
   * Retrieves a single audit log record by ID.
   * Intended for read operations (e.g., admin dashboard controllers).
   *
   * @param id The unique audit log identifier
   * @returns The audit log details
   * @throws {AuditLogNotFoundError} If the audit log record does not exist
   * @throws {AuditLogServiceError} If repository database access fails
   */
  public async getAuditLogById(id: string): Promise<AuditLogOutput> {
    try {
      const log = await this.repository.findById(id);
      if (!log) {
        throw new AuditLogNotFoundError(`Audit log record with ID ${id} was not found.`);
      }
      return log;
    } catch (error) {
      if (error instanceof AuditLogServiceError) {
        throw error;
      }
      this.handleRepositoryError(error, `Failed to retrieve audit log for ID ${id}.`);
    }
  }

  /**
   * Retrieves, filters, and paginates audit log records.
   * Intended for read operations (e.g., admin dashboard controllers).
   *
   * @param options Query, filter, and pagination options
   * @returns Paginated results containing items and pagination metadata
   * @throws {AuditLogValidationError} If pagination or sorting parameters are invalid
   * @throws {AuditLogServiceError} If repository database access fails
   */
  public async getAuditLogs(options: FindAuditLogsOptions): Promise<PaginatedAuditLogs> {
    try {
      const normalizedPagination = this.normalizePagination(options.pagination);
      this.validatePagination(normalizedPagination.page, normalizedPagination.limit);

      const sorting = options.sorting || {};
      const normalizedField = sorting.field || AUDIT_LOG_SORT.DEFAULT_FIELD;
      const normalizedOrder = sorting.order || AUDIT_LOG_SORT.DEFAULT_ORDER;
      this.validateSorting(normalizedField, normalizedOrder);

      const normalizedSearch = this.normalizeSearch(options.search);

      const queryOptions: FindAuditLogsOptions = {
        pagination: normalizedPagination,
        sorting: {
          field: normalizedField as AuditLogSortField,
          order: normalizedOrder as AuditLogSortOrder,
        },
        search: normalizedSearch,
        filters: options.filters || {},
      };

      const result = await this.repository.findMany(queryOptions);

      const paginationMeta = this.calculatePagination(
        result.total,
        normalizedPagination.limit,
        normalizedPagination.page
      );

      return {
        items: result.items,
        pagination: paginationMeta,
      };
    } catch (error) {
      if (error instanceof AuditLogServiceError) {
        throw error;
      }
      this.handleRepositoryError(error, 'Failed to retrieve paginated audit logs.');
    }
  }

  /**
   * Normalizes pagination inputs, mapping undefined or null values to standard defaults.
   */
  private normalizePagination(pagination?: { page?: number; limit?: number }): {
    page: number;
    limit: number;
  } {
    const page = pagination?.page ?? AUDIT_LOG_PAGINATION.DEFAULT_PAGE;
    const limit = pagination?.limit ?? AUDIT_LOG_PAGINATION.DEFAULT_LIMIT;
    return { page, limit };
  }

  /**
   * Validates pagination parameters and throws a validation error if bounds are violated.
   */
  private validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new AuditLogValidationError(
        `Pagination page must be greater than or equal to 1. Provided: ${page}`
      );
    }
    if (limit < 1 || limit > AUDIT_LOG_PAGINATION.MAX_LIMIT) {
      throw new AuditLogValidationError(
        `Pagination limit must be between 1 and ${AUDIT_LOG_PAGINATION.MAX_LIMIT}. Provided: ${limit}`
      );
    }
  }

  /**
   * Validates sorting configurations and throws a validation error if sort rules are violated.
   */
  private validateSorting(field: string, order: string): void {
    if (!(AUDIT_LOG_SORT.ALLOWED_FIELDS as readonly string[]).includes(field)) {
      throw new AuditLogValidationError(
        `Sorting field '${field}' is not supported. Allowed fields: ${AUDIT_LOG_SORT.ALLOWED_FIELDS.join(', ')}`
      );
    }
    if (order !== 'asc' && order !== 'desc') {
      throw new AuditLogValidationError(
        `Sorting order must be 'asc' or 'desc'. Provided: ${order}`
      );
    }
  }

  /**
   * Trims whitespace from search parameters and converts empty search queries to undefined.
   */
  private normalizeSearch(search?: string): string | undefined {
    if (search === undefined || search === null) {
      return undefined;
    }
    const trimmed = search.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  /**
   * Calculates pagination metadata based on total items, limit, and current page.
   */
  private calculatePagination(total: number, limit: number, page: number) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Helper to ensure RepositoryErrors are translated and wrapped, while letting runtime errors bubble up.
   */
  private handleRepositoryError(error: unknown, fallbackMessage: string): never {
    if (error instanceof RepositoryError) {
      throw new AuditLogServiceError('AUDIT_LOG_SERVICE_FAILED', fallbackMessage, error);
    }
    throw error as Error;
  }
}
