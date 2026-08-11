import { PrismaClient, Prisma, TicketStatus, TicketPriority } from '@prisma/client';
import { ITicketRepository } from './ticket.repository.interface';
import { TICKET_BASE_SELECT, TICKET_DETAIL_SELECT } from './ticket.repository.select';
import {
  CreateTicketRepositoryInput,
  UpdateTicketRepositoryInput,
  TicketBaseOutput,
  TicketDetailOutput,
  FindTicketsRepositoryOptions,
  TicketFiltersInput,
  PaginatedTicketsOutput,
  QueryOptions,
} from './ticket.repository.types';
import { TicketRepositoryError } from './ticket.repository.errors';
import { TICKET_PAGINATION, TICKET_SORT } from '../constants/ticket.constants';

/**
 * Concrete Prisma-backed repository implementing the ITicketRepository contract.
 * Decouples raw Prisma operations, filters logical deletes, and handles queries.
 */
export class TicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Persists a new Ticket record.
   */
  public async create(data: CreateTicketRepositoryInput): Promise<TicketDetailOutput> {
    try {
      const result = await this.prisma.ticket.create({
        data: {
          subject: data.subject,
          description: data.description,
          status: data.status || TicketStatus.OPEN,
          priority: data.priority || TicketPriority.MEDIUM,
          assignedToId: data.assignedToId || null,
          clientId: data.clientId || null,
          projectId: data.projectId || null,
          createdById: data.createdById || null,
        },
        select: TICKET_DETAIL_SELECT,
      });

      return result as unknown as TicketDetailOutput;
    } catch (error) {
      throw new TicketRepositoryError(
        'DATABASE_WRITE_FAILED',
        'Database write failed while creating ticket record.',
        error
      );
    }
  }

  /**
   * Retrieves a Ticket record by unique ID. Excludes soft-deleted records by default.
   */
  public async findById(id: string, options?: QueryOptions): Promise<TicketDetailOutput | null> {
    try {
      const result = await this.prisma.ticket.findFirst({
        where: {
          id,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: TICKET_DETAIL_SELECT,
      });

      return result as unknown as TicketDetailOutput | null;
    } catch (error) {
      throw new TicketRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching ticket by ID ${id}.`,
        error
      );
    }
  }

  /**
   * Retrieves, filters, and paginates Ticket records. Excludes soft-deleted records by default.
   */
  public async findMany(options: FindTicketsRepositoryOptions): Promise<PaginatedTicketsOutput> {
    try {
      const page = Math.max(1, options.pagination?.page ?? TICKET_PAGINATION.DEFAULT_PAGE);
      const rawLimit = options.pagination?.limit ?? TICKET_PAGINATION.DEFAULT_LIMIT;
      const limit = Math.min(TICKET_PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause({
        search: options.search,
        status: options.status,
        priority: options.priority,
        assignedToId: options.assignedToId,
        clientId: options.clientId,
        projectId: options.projectId,
        includeDeleted: options.includeDeleted,
      });

      const orderBy = this.buildOrderBy(options.sortField, options.sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.ticket.count({ where }),
        this.prisma.ticket.findMany({
          where,
          select: TICKET_BASE_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      return {
        items: items as unknown as TicketBaseOutput[],
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new TicketRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while listing tickets.',
        error
      );
    }
  }

  /**
   * Counts Ticket records matching query filter. Excludes soft-deleted records by default.
   */
  public async count(filters: TicketFiltersInput): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await this.prisma.ticket.count({ where });
    } catch (error) {
      throw new TicketRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while counting tickets.',
        error
      );
    }
  }

  /**
   * Updates an existing Ticket record.
   */
  public async update(
    id: string,
    data: UpdateTicketRepositoryInput
  ): Promise<TicketDetailOutput | null> {
    try {
      const result = await this.prisma.ticket.update({
        where: { id },
        data: {
          subject: data.subject,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assignedToId: data.assignedToId,
          clientId: data.clientId,
          projectId: data.projectId,
          updatedById: data.updatedById,
          deletedAt: data.deletedAt,
        },
        select: TICKET_DETAIL_SELECT,
      });

      return result as unknown as TicketDetailOutput;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw new TicketRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating ticket with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Performs soft deletion of a Ticket record by setting the deletedAt timestamp.
   */
  public async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.ticket.update({
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
      throw new TicketRepositoryError(
        'DATABASE_DELETE_FAILED',
        `Database update failed while soft-deleting ticket with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Restores a soft-deleted Ticket record by nullifying its deletedAt timestamp.
   */
  public async restore(id: string): Promise<TicketDetailOutput> {
    try {
      const result = await this.prisma.ticket.update({
        where: { id },
        data: {
          deletedAt: null,
        },
        select: TICKET_DETAIL_SELECT,
      });
      return result as unknown as TicketDetailOutput;
    } catch (error) {
      throw new TicketRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while restoring ticket with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Helper to build Prisma dynamic filters object.
   */
  private buildWhereClause(filters: TicketFiltersInput): Prisma.TicketWhereInput {
    const where: Prisma.TicketWhereInput = {};

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.search) {
      const searchTrim = filters.search.trim();
      where.OR = [
        { subject: { contains: searchTrim, mode: 'insensitive' } },
        { description: { contains: searchTrim, mode: 'insensitive' } },
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
  ): Prisma.TicketOrderByWithRelationInput {
    const field = sortField || TICKET_SORT.DEFAULT_FIELD;
    const order = sortOrder || TICKET_SORT.DEFAULT_ORDER;
    return { [field]: order };
  }
}
