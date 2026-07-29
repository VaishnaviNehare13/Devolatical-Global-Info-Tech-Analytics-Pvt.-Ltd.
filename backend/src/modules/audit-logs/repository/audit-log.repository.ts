import { PrismaClient, Prisma } from '@prisma/client';
import { IAuditLogRepository } from './audit-log.repository.interface';
import { AUDIT_LOG_SELECT } from './audit-log.repository.select';
import {
  CreateAuditLogData,
  AuditLogOutput,
  FindAuditLogsOptions,
  RawPaginatedAuditLogs,
  AuditLogSortField,
  AuditLogSortOrder,
} from './audit-log.types';
import { AuditLogRepositoryError } from './audit-log.errors';

/**
 * Concrete Prisma-based Audit Log Repository implementation.
 * Encapsulates database actions for Audit Logs module and wraps errors.
 */
export class AuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Creates a new audit log record.
   */
  public async create(data: CreateAuditLogData): Promise<AuditLogOutput> {
    try {
      const result = await this.prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          requestId: data.requestId || null,
          module: data.module,
          action: data.action,
          entityType: data.entityType || null,
          entityId: data.entityId || null,
          resourceName: data.resourceName || null,
          oldValues:
            data.oldValues !== undefined && data.oldValues !== null
              ? (data.oldValues as Prisma.InputJsonValue)
              : Prisma.DbNull,
          newValues:
            data.newValues !== undefined && data.newValues !== null
              ? (data.newValues as Prisma.InputJsonValue)
              : Prisma.DbNull,
          metadata:
            data.metadata !== undefined && data.metadata !== null
              ? (data.metadata as Prisma.InputJsonValue)
              : Prisma.DbNull,
          status: data.status,
          severity: data.severity || 'INFO',
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
        select: AUDIT_LOG_SELECT,
      });

      return result as unknown as AuditLogOutput;
    } catch (error) {
      throw new AuditLogRepositoryError(
        'DATABASE_WRITE_FAILED',
        'Database write failed while creating audit log record.',
        error
      );
    }
  }

  /**
   * Retrieves an audit log record by its unique ID.
   */
  public async findById(id: string): Promise<AuditLogOutput | null> {
    try {
      const result = await this.prisma.auditLog.findUnique({
        where: { id },
        select: AUDIT_LOG_SELECT,
      });

      return result as unknown as AuditLogOutput | null;
    } catch (error) {
      throw new AuditLogRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching audit log for ID ${id}.`,
        error
      );
    }
  }

  /**
   * Finds, filters, and paginates audit logs.
   */
  public async findMany(options: FindAuditLogsOptions): Promise<RawPaginatedAuditLogs> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderBy(options.sorting);
      const { skip, take } = this.buildPagination(options.pagination);

      const [items, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          select: AUDIT_LOG_SELECT,
          orderBy,
          skip,
          take,
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      return {
        items: items as unknown as AuditLogOutput[],
        total,
      };
    } catch (error) {
      throw new AuditLogRepositoryError(
        'DATABASE_READ_FAILED',
        'Database query failed while fetching many audit logs.',
        error
      );
    }
  }

  /**
   * Prepares the Prisma `where` clause according to query criteria.
   */
  private buildWhereClause(options: FindAuditLogsOptions): Prisma.AuditLogWhereInput {
    const filters = options.filters || {};
    const search = options.search;

    const searchConditions = search
      ? {
          OR: [
            { resourceName: { contains: search, mode: 'insensitive' as const } },
            { entityId: { contains: search, mode: 'insensitive' as const } },
            { requestId: { contains: search, mode: 'insensitive' as const } },
            {
              user: {
                displayName: { contains: search, mode: 'insensitive' as const },
              },
            },
            {
              user: {
                email: { contains: search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const dateConditions: Prisma.AuditLogWhereInput = {};
    if (filters.dateFrom || filters.dateTo) {
      dateConditions.createdAt = {};
      if (filters.dateFrom) {
        dateConditions.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        dateConditions.createdAt.lte = new Date(filters.dateTo);
      }
    }

    return {
      ...(filters.module ? { module: filters.module } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.severity ? { severity: filters.severity } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.requestId ? { requestId: filters.requestId } : {}),
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.entityId ? { entityId: filters.entityId } : {}),
      ...(filters.resourceName ? { resourceName: filters.resourceName } : {}),
      ...dateConditions,
      ...searchConditions,
    };
  }

  /**
   * Prepares the Prisma `orderBy` clause according to options.
   */
  private buildOrderBy(sorting?: {
    field?: AuditLogSortField;
    order?: AuditLogSortOrder;
  }): Prisma.AuditLogOrderByWithRelationInput {
    const field = sorting?.field || 'createdAt';
    const order = sorting?.order === 'asc' ? 'asc' : 'desc';

    return {
      [field]: order,
    };
  }

  /**
   * Prepares pagination skip/take parameters.
   */
  private buildPagination(pagination?: { page?: number; limit?: number }): {
    skip: number;
    take: number;
  } {
    const page = Math.max(1, pagination?.page || 1);
    const limit = Math.max(1, pagination?.limit || 20);
    const skip = (page - 1) * limit;

    return { skip, take: limit };
  }
}
