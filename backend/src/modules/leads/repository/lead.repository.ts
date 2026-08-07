import { PrismaClient, Prisma, LeadStatus, LeadPriority } from '@prisma/client';
import { ILeadRepository } from './lead.repository.interface';
import { LEAD_BASE_SELECT, LEAD_DETAIL_SELECT } from './lead.repository.select';
import {
  CreateLeadRepositoryInput,
  UpdateLeadRepositoryInput,
  LeadDetailOutput,
  FindLeadsRepositoryOptions,
  LeadFiltersInput,
  PaginatedLeadsOutput,
  QueryOptions,
} from './lead.repository.types';
import { LeadRepositoryError } from './lead.repository.errors';
import { LEAD_PAGINATION, LEAD_SORT } from '../constants/lead.constants';

/**
 * Concrete Prisma-backed repository implementing the ILeadRepository contract.
 * Decouples raw Prisma operations, filters logical deletes, and handles queries.
 */
export class LeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Persists a new Lead record.
   */
  public async create(data: CreateLeadRepositoryInput): Promise<LeadDetailOutput> {
    try {
      const result = await this.prisma.lead.create({
        data: {
          name: data.name,
          companyName: data.companyName || null,
          email: data.email || null,
          phone: data.phone || null,
          status: data.status || LeadStatus.NEW,
          priority: data.priority || LeadPriority.MEDIUM,
          source: data.source || null,
          industry: data.industry || null,
          notes: data.notes || null,
          assignedToId: data.assignedToId || null,
          createdById: data.createdById || null,
        },
        select: LEAD_DETAIL_SELECT,
      });

      return result as unknown as LeadDetailOutput;
    } catch (error) {
      throw new LeadRepositoryError(
        'DATABASE_WRITE_FAILED',
        'Database write failed while creating lead record.',
        error
      );
    }
  }

  /**
   * Retrieves a Lead record by unique ID. Excludes soft-deleted records by default.
   */
  public async findById(id: string, options?: QueryOptions): Promise<LeadDetailOutput | null> {
    try {
      const result = await this.prisma.lead.findFirst({
        where: {
          id,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: LEAD_DETAIL_SELECT,
      });

      return result as unknown as LeadDetailOutput | null;
    } catch (error) {
      throw new LeadRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching lead by ID ${id}.`,
        error
      );
    }
  }

  /**
   * Retrieves a Lead record by unique email address. Excludes soft-deleted records by default.
   */
  public async findByEmail(
    email: string,
    options?: QueryOptions
  ): Promise<LeadDetailOutput | null> {
    try {
      const result = await this.prisma.lead.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: LEAD_DETAIL_SELECT,
      });

      return result as unknown as LeadDetailOutput | null;
    } catch (error) {
      throw new LeadRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching lead by email ${email}.`,
        error
      );
    }
  }

  /**
   * Retrieves, filters, and paginates Lead records. Excludes soft-deleted records by default.
   */
  public async findMany(options: FindLeadsRepositoryOptions): Promise<PaginatedLeadsOutput> {
    try {
      const page = Math.max(1, options.pagination?.page ?? LEAD_PAGINATION.DEFAULT_PAGE);
      const rawLimit = options.pagination?.limit ?? LEAD_PAGINATION.DEFAULT_LIMIT;
      const limit = Math.min(LEAD_PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause({
        search: options.search,
        status: options.status,
        priority: options.priority,
        source: options.source,
        assignedToId: options.assignedToId,
        includeDeleted: options.includeDeleted,
      });

      const orderBy = this.buildOrderBy(options.sortField, options.sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.lead.count({ where }),
        this.prisma.lead.findMany({
          where,
          select: LEAD_BASE_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      return {
        items: items as unknown as LeadDetailOutput[],
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new LeadRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while listing leads.',
        error
      );
    }
  }

  /**
   * Counts Lead records matching query filter. Excludes soft-deleted records by default.
   */
  public async count(filters: LeadFiltersInput): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await this.prisma.lead.count({ where });
    } catch (error) {
      throw new LeadRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while counting leads.',
        error
      );
    }
  }

  /**
   * Updates an existing Lead record.
   */
  public async update(
    id: string,
    data: UpdateLeadRepositoryInput
  ): Promise<LeadDetailOutput | null> {
    try {
      const result = await this.prisma.lead.update({
        where: { id },
        data: {
          name: data.name,
          companyName: data.companyName,
          email: data.email,
          phone: data.phone,
          status: data.status,
          priority: data.priority,
          source: data.source,
          industry: data.industry,
          notes: data.notes,
          assignedToId: data.assignedToId,
          updatedById: data.updatedById,
          deletedAt: data.deletedAt,
        },
        select: LEAD_DETAIL_SELECT,
      });

      return result as unknown as LeadDetailOutput;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw new LeadRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating lead with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Performs soft deletion of a Lead record by setting the deletedAt timestamp.
   */
  public async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.lead.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw new LeadRepositoryError(
        'DATABASE_DELETE_FAILED',
        `Database update failed while soft-deleting lead with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Restores a soft-deleted Lead record by nullifying its deletedAt timestamp.
   */
  public async restore(id: string): Promise<LeadDetailOutput> {
    try {
      const result = await this.prisma.lead.update({
        where: { id },
        data: {
          deletedAt: null,
        },
        select: LEAD_DETAIL_SELECT,
      });
      return result as unknown as LeadDetailOutput;
    } catch (error) {
      throw new LeadRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while restoring lead with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Checks if active lead with specific email address exists. Excludes soft-deleted records.
   */
  public async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.lead.count({
        where: {
          email: { equals: email, mode: 'insensitive' },
          deletedAt: null,
        },
      });
      return count > 0;
    } catch (error) {
      throw new LeadRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while checking lead existence for email ${email}.`,
        error
      );
    }
  }

  /**
   * Helper to build Prisma dynamic filters object.
   */
  private buildWhereClause(filters: LeadFiltersInput): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {};

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.search) {
      const searchTrim = filters.search.trim();
      where.OR = [
        { name: { contains: searchTrim, mode: 'insensitive' } },
        { companyName: { contains: searchTrim, mode: 'insensitive' } },
        { email: { contains: searchTrim, mode: 'insensitive' } },
        { phone: { contains: searchTrim, mode: 'insensitive' } },
        { industry: { contains: searchTrim, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Helper to build Prisma dynamic orderBy sort settings.
   */
  private buildOrderBy(
    sortField?: string,
    sortOrder?: 'asc' | 'desc'
  ): Prisma.LeadOrderByWithRelationInput {
    const field = sortField || LEAD_SORT.DEFAULT_FIELD;
    const order = sortOrder || LEAD_SORT.DEFAULT_ORDER;
    return { [field]: order };
  }
}
