import { PrismaClient, Prisma, ClientStatus } from '@prisma/client';
import { IClientRepository } from './client.repository.interface';
import { CLIENT_BASE_SELECT, CLIENT_DETAIL_SELECT } from './client.repository.select';
import {
  CreateClientRepositoryInput,
  UpdateClientRepositoryInput,
  ClientDetailOutput,
  FindClientsRepositoryOptions,
  ClientFiltersInput,
  PaginatedClientsOutput,
  QueryOptions,
} from './client.repository.types';
import { ClientRepositoryError } from './client.repository.errors';
import { CLIENT_PAGINATION, CLIENT_SORT } from '../constants/client.constants';

/**
 * Concrete Prisma-based Client Repository implementation.
 * Encapsulates database actions for Client module and translates errors.
 */
export class ClientRepository implements IClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Creates a new client record.
   */
  public async create(data: CreateClientRepositoryInput): Promise<ClientDetailOutput> {
    try {
      const result = await this.prisma.client.create({
        data: {
          name: data.name,
          code: data.code,
          email: data.email || null,
          phone: data.phone || null,
          website: data.website || null,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          postalCode: data.postalCode || null,
          notes: data.notes || null,
          status: data.status || ClientStatus.ACTIVE,
          accountManagerId: data.accountManagerId || null,
          createdById: data.createdById || null,
        },
        select: CLIENT_DETAIL_SELECT,
      });

      return result as unknown as ClientDetailOutput;
    } catch (error) {
      throw new ClientRepositoryError(
        'DATABASE_WRITE_FAILED',
        'Database write failed while creating client record.',
        error
      );
    }
  }

  /**
   * Retrieves a client by unique ID if not soft deleted.
   */
  public async findById(id: string, options?: QueryOptions): Promise<ClientDetailOutput | null> {
    try {
      const result = await this.prisma.client.findFirst({
        where: {
          id,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: CLIENT_DETAIL_SELECT,
      });

      return result as unknown as ClientDetailOutput | null;
    } catch (error) {
      throw new ClientRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching client by ID ${id}.`,
        error
      );
    }
  }

  /**
   * Retrieves a client by unique code.
   */
  public async findByCode(
    code: string,
    options?: QueryOptions
  ): Promise<ClientDetailOutput | null> {
    try {
      const result = await this.prisma.client.findFirst({
        where: {
          code,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: CLIENT_DETAIL_SELECT,
      });

      return result as unknown as ClientDetailOutput | null;
    } catch (error) {
      throw new ClientRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching client by code ${code}.`,
        error
      );
    }
  }

  /**
   * Searches, filters, and paginates clients.
   */
  public async findMany(options: FindClientsRepositoryOptions): Promise<PaginatedClientsOutput> {
    try {
      const page = Math.max(1, options.pagination?.page ?? CLIENT_PAGINATION.DEFAULT_PAGE);
      const rawLimit = options.pagination?.limit ?? CLIENT_PAGINATION.DEFAULT_LIMIT;
      const limit = Math.min(CLIENT_PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause({
        search: options.search,
        status: options.status,
        accountManagerId: options.accountManagerId,
        includeDeleted: options.includeDeleted,
      });

      const orderBy = this.buildOrderBy(options.sortField, options.sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.client.count({ where }),
        this.prisma.client.findMany({
          where,
          select: CLIENT_BASE_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      return {
        items: items as unknown as ClientDetailOutput[],
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new ClientRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while listing clients.',
        error
      );
    }
  }

  /**
   * Counts clients matching filter options.
   */
  public async count(filters: ClientFiltersInput): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await this.prisma.client.count({ where });
    } catch (error) {
      throw new ClientRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while counting clients.',
        error
      );
    }
  }

  /**
   * Updates an existing client record.
   */
  public async update(
    id: string,
    data: UpdateClientRepositoryInput
  ): Promise<ClientDetailOutput | null> {
    try {
      const result = await this.prisma.client.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          email: data.email,
          phone: data.phone,
          website: data.website,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          notes: data.notes,
          status: data.status,
          accountManagerId: data.accountManagerId,
          updatedById: data.updatedById,
          deletedAt: data.deletedAt,
        },
        select: CLIENT_DETAIL_SELECT,
      });

      return result as unknown as ClientDetailOutput;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw new ClientRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating client with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Soft deletes a client record. Sets status to ARCHIVED.
   */
  public async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.client.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: ClientStatus.ARCHIVED,
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw new ClientRepositoryError(
        'DATABASE_DELETE_FAILED',
        `Database update failed while soft-deleting client with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Checks if a client with the given code exists.
   */
  public async existsByCode(code: string): Promise<boolean> {
    try {
      const count = await this.prisma.client.count({
        where: { code },
      });
      return count > 0;
    } catch (error) {
      throw new ClientRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while checking client existence for code ${code}.`,
        error
      );
    }
  }

  /**
   * Prepares the Prisma `where` clause according to query criteria.
   */
  private buildWhereClause(filters: ClientFiltersInput): Prisma.ClientWhereInput {
    const where: Prisma.ClientWhereInput = {};

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.accountManagerId) {
      where.accountManagerId = filters.accountManagerId;
    }

    if (filters.search) {
      const searchTrim = filters.search.trim();
      where.OR = [
        { name: { contains: searchTrim, mode: 'insensitive' } },
        { code: { contains: searchTrim, mode: 'insensitive' } },
        { email: { contains: searchTrim, mode: 'insensitive' } },
        { phone: { contains: searchTrim, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Builds the Prisma `orderBy` parameter.
   */
  private buildOrderBy(
    sortField?: string,
    sortOrder?: 'asc' | 'desc'
  ): Prisma.ClientOrderByWithRelationInput {
    const field = sortField || CLIENT_SORT.DEFAULT_FIELD;
    const order = sortOrder || CLIENT_SORT.DEFAULT_ORDER;
    return { [field]: order };
  }
}
