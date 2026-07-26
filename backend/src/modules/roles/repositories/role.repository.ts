import { PrismaClient, Prisma, RoleType as PrismaRoleType } from '@prisma/client';
import { IRoleRepository } from './role.repository.interface';
import {
  RoleDetails,
  FindRolesOptions,
  PaginatedRoles,
  CreateRoleData,
  UpdateRoleData,
} from '../types/role.types';
import { RoleRepositoryError } from '../types/role.errors';
import { RoleMapper } from '../mappers/role.mapper';
import {
  ROLE_SUMMARY_SELECT,
  ROLE_LIST_SELECT,
  ROLE_DETAILS_SELECT,
} from './role.repository.select';
import { ROLE_PAGINATION, ROLE_SORT } from '../constants/role.constants';

type DbRoleSummary = Prisma.RoleGetPayload<{ select: typeof ROLE_SUMMARY_SELECT }>;

/**
 * Concrete implementation of IRoleRepository using Prisma Client.
 * Responsible strictly for data persistence operations. Exposes no business, validation, or HTTP logic.
 */
export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retrieves a paginated, sorted, and filtered list of roles.
   */
  public async findRoles(options: FindRolesOptions): Promise<PaginatedRoles> {
    try {
      const page = options.pagination?.page ?? ROLE_PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        options.pagination?.limit ?? ROLE_PAGINATION.DEFAULT_LIMIT,
        ROLE_PAGINATION.MAX_LIMIT
      );
      const skip = (page - 1) * limit;

      // Build sorting options
      const sortField = options.sorting?.field ?? ROLE_SORT.DEFAULT_FIELD;
      const sortOrder = options.sorting?.order ?? ROLE_SORT.DEFAULT_ORDER;
      const orderBy: Prisma.RoleOrderByWithRelationInput = { [sortField]: sortOrder };

      // Build where conditions
      let where: Prisma.RoleWhereInput = {
        deletedAt: options.filters?.includeDeleted ? undefined : null,
      };

      if (options.filters?.isActive !== undefined) {
        where.isActive = options.filters.isActive;
      }

      if (options.filters?.type !== undefined) {
        where.type = options.filters.type as PrismaRoleType;
      }

      if (options.search) {
        const searchPattern = options.search;
        where = {
          ...where,
          OR: [
            { name: { contains: searchPattern, mode: 'insensitive' } },
            { code: { contains: searchPattern, mode: 'insensitive' } },
            { description: { contains: searchPattern, mode: 'insensitive' } },
          ],
        };
      }

      // Fetch items and count concurrently
      const [records, totalCount] = await Promise.all([
        this.prisma.role.findMany({
          where,
          select: ROLE_LIST_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.role.count({ where }),
      ]);

      const items = records.map((record) => RoleMapper.toDomainSummary(record));
      const totalPages = Math.ceil(totalCount / limit);

      return {
        items,
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_QUERY_ERROR',
        'Failed to query paginated roles list.',
        error
      );
    }
  }

  /**
   * Retrieves summary details of a role by ID. Returns null if not found.
   */
  public async findRoleById(id: string): Promise<RoleDetails | null> {
    try {
      const record = await this.prisma.role.findUnique({
        where: { id },
        select: ROLE_DETAILS_SELECT,
      });

      if (!record) {
        return null;
      }

      return RoleMapper.toDomainDetails(record);
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to retrieve role details by ID: ${id}`,
        error
      );
    }
  }

  /**
   * Retrieves summary details of a role by unique role code. Returns null if not found.
   */
  public async findRoleByCode(code: string): Promise<RoleDetails | null> {
    try {
      const record = await this.prisma.role.findUnique({
        where: { code },
        select: ROLE_DETAILS_SELECT,
      });

      if (!record) {
        return null;
      }

      return RoleMapper.toDomainDetails(record);
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to retrieve role details by code: ${code}`,
        error
      );
    }
  }

  /**
   * Retrieves summary details of a role by name. Returns null if not found.
   */
  public async findRoleByName(name: string): Promise<RoleDetails | null> {
    try {
      const record = await this.prisma.role.findUnique({
        where: { name },
        select: ROLE_DETAILS_SELECT,
      });

      if (!record) {
        return null;
      }

      return RoleMapper.toDomainDetails(record);
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to retrieve role details by name: ${name}`,
        error
      );
    }
  }

  /**
   * Checks if any role exists in database persistence matching the given unique role code.
   */
  public async existsByCode(code: string): Promise<boolean> {
    try {
      const record = await this.prisma.role.findUnique({
        where: { code },
        select: { id: true },
      });
      return record !== null;
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to verify role existence by code: ${code}`,
        error
      );
    }
  }

  /**
   * Checks if any role exists matching the given name.
   */
  public async existsByName(name: string): Promise<boolean> {
    try {
      const record = await this.prisma.role.findUnique({
        where: { name },
        select: { id: true },
      });
      return record !== null;
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to verify role existence by name: ${name}`,
        error
      );
    }
  }

  /**
   * Inserts a new role into database persistence.
   */
  public async createRole(data: CreateRoleData): Promise<RoleDetails> {
    try {
      const record = await this.prisma.role.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          priority: data.priority ?? 0,
          isDefault: data.isDefault ?? false,
          type: PrismaRoleType.CUSTOM, // All roles created via repository are CUSTOM
        },
        select: ROLE_DETAILS_SELECT,
      });

      return RoleMapper.toDomainDetails(record);
    } catch (error) {
      throw new RoleRepositoryError('DB_WRITE_ERROR', 'Failed to insert new role record.', error);
    }
  }

  /**
   * Modifies columns on a role.
   */
  public async updateRole(id: string, data: UpdateRoleData): Promise<RoleDetails> {
    try {
      const record = await this.prisma.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          priority: data.priority,
          isDefault: data.isDefault,
        },
        select: ROLE_DETAILS_SELECT,
      });

      return RoleMapper.toDomainDetails(record);
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_WRITE_ERROR',
        `Failed to update role record with ID: ${id}`,
        error
      );
    }
  }

  /**
   * Toggles the active status flag of a role.
   */
  public async updateRoleStatus(id: string, isActive: boolean): Promise<RoleDetails> {
    try {
      const record = await this.prisma.role.update({
        where: { id },
        data: { isActive },
        select: ROLE_DETAILS_SELECT,
      });

      return RoleMapper.toDomainDetails(record);
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_WRITE_ERROR',
        `Failed to update activation status for role with ID: ${id}`,
        error
      );
    }
  }

  /**
   * Marks a role as soft-deleted in persistence.
   */
  public async softDeleteRole(id: string): Promise<boolean> {
    try {
      const activeRecord = await this.findActiveRoleById(id);
      if (!activeRecord) {
        return false;
      }

      await this.prisma.role.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return true;
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_WRITE_ERROR',
        `Failed to soft-delete role with ID: ${id}`,
        error
      );
    }
  }

  /**
   * Counts the number of active user role assignments associated with a role.
   */
  public async countUsersUsingRole(roleId: string): Promise<number> {
    try {
      return await this.prisma.userRole.count({
        where: {
          roleId,
          isActive: true,
          deletedAt: null,
        },
      });
    } catch (error) {
      throw new RoleRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to count user associations for role ID: ${roleId}`,
        error
      );
    }
  }

  /**
   * Helper lookup function to extract active records by ID.
   */
  private async findActiveRoleById(id: string): Promise<DbRoleSummary | null> {
    return this.prisma.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: ROLE_SUMMARY_SELECT,
    });
  }
}
