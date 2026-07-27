import {
  PrismaClient,
  Prisma,
  Module as PrismaModule,
  Resource as PrismaResource,
  Action as PrismaAction,
} from '@prisma/client';
import { IPermissionRepository } from './permission.repository.interface';
import {
  PermissionDetails,
  FindPermissionsOptions,
  PaginatedPermissions,
  CreatePermissionData,
  UpdatePermissionData,
} from '../types/permission.types';
import { PermissionRepositoryError } from '../types/permission.errors';
import { PermissionMapper } from '../mappers/permission.mapper';
import {
  PERMISSION_SUMMARY_SELECT,
  PERMISSION_LIST_SELECT,
  PERMISSION_DETAILS_SELECT,
} from './permission.repository.select';
import { PERMISSION_PAGINATION, PERMISSION_SORT } from '../constants/permission.constants';

type DbPermissionSummary = Prisma.PermissionGetPayload<{
  select: typeof PERMISSION_SUMMARY_SELECT;
}>;

/**
 * Concrete implementation of IPermissionRepository using Prisma Client.
 * Responsible strictly for data persistence operations. Exposes no business, validation, or HTTP logic.
 */
export class PermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retrieves a paginated, sorted, and filtered list of permissions.
   */
  public async findPermissions(options: FindPermissionsOptions): Promise<PaginatedPermissions> {
    try {
      const page = options.pagination?.page ?? PERMISSION_PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        options.pagination?.limit ?? PERMISSION_PAGINATION.DEFAULT_LIMIT,
        PERMISSION_PAGINATION.MAX_LIMIT
      );
      const skip = (page - 1) * limit;

      // Build sorting options
      const sortField = options.sorting?.field ?? PERMISSION_SORT.DEFAULT_FIELD;
      const sortOrder = options.sorting?.order ?? PERMISSION_SORT.DEFAULT_ORDER;
      const orderBy: Prisma.PermissionOrderByWithRelationInput = { [sortField]: sortOrder };

      // Build where conditions
      let where: Prisma.PermissionWhereInput = {
        deletedAt: options.filters?.includeDeleted ? undefined : null,
      };

      if (options.filters?.isActive !== undefined) {
        where.isActive = options.filters.isActive;
      }

      if (options.filters?.module !== undefined) {
        where.module = options.filters.module as PrismaModule;
      }

      if (options.filters?.resource !== undefined) {
        where.resource = options.filters.resource as PrismaResource;
      }

      if (options.filters?.action !== undefined) {
        where.action = options.filters.action as PrismaAction;
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
        this.prisma.permission.findMany({
          where,
          select: PERMISSION_LIST_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.permission.count({ where }),
      ]);

      const items = records.map((record) => PermissionMapper.toDomainSummary(record));
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
      throw new PermissionRepositoryError(
        'DB_QUERY_ERROR',
        'Failed to query paginated permissions list.',
        error
      );
    }
  }

  /**
   * Retrieves summary details of a permission by ID. Returns null if not found.
   */
  public async findPermissionById(id: string): Promise<PermissionDetails | null> {
    try {
      const record = await this.prisma.permission.findUnique({
        where: { id },
        select: PERMISSION_DETAILS_SELECT,
      });

      if (!record) {
        return null;
      }

      return PermissionMapper.toDomainDetails(record);
    } catch (error) {
      throw new PermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to retrieve permission details by ID: ${id}`,
        error
      );
    }
  }

  /**
   * Retrieves summary details of a permission by unique permission code. Returns null if not found.
   */
  public async findPermissionByCode(code: string): Promise<PermissionDetails | null> {
    try {
      const record = await this.prisma.permission.findUnique({
        where: { code },
        select: PERMISSION_DETAILS_SELECT,
      });

      if (!record) {
        return null;
      }

      return PermissionMapper.toDomainDetails(record);
    } catch (error) {
      throw new PermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to retrieve permission details by code: ${code}`,
        error
      );
    }
  }

  /**
   * Retrieves summary details of a permission by name. Returns null if not found.
   */
  public async findPermissionByName(name: string): Promise<PermissionDetails | null> {
    try {
      const record = await this.prisma.permission.findUnique({
        where: { name },
        select: PERMISSION_DETAILS_SELECT,
      });

      if (!record) {
        return null;
      }

      return PermissionMapper.toDomainDetails(record);
    } catch (error) {
      throw new PermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to retrieve permission details by name: ${name}`,
        error
      );
    }
  }

  /**
   * Checks if any permission exists in database persistence matching the given unique permission code.
   */
  public async existsByCode(code: string): Promise<boolean> {
    try {
      const record = await this.prisma.permission.findUnique({
        where: { code },
        select: { id: true },
      });
      return record !== null;
    } catch (error) {
      throw new PermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to verify permission existence by code: ${code}`,
        error
      );
    }
  }

  /**
   * Checks if any permission exists matching the given name.
   */
  public async existsByName(name: string): Promise<boolean> {
    try {
      const record = await this.prisma.permission.findUnique({
        where: { name },
        select: { id: true },
      });
      return record !== null;
    } catch (error) {
      throw new PermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to verify permission existence by name: ${name}`,
        error
      );
    }
  }

  /**
   * Inserts a new permission into database persistence.
   */
  public async createPermission(data: CreatePermissionData): Promise<PermissionDetails> {
    try {
      const record = await this.prisma.permission.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          module: data.module as PrismaModule,
          resource: data.resource as PrismaResource,
          action: data.action as PrismaAction,
          displayOrder: data.displayOrder ?? 0,
        },
        select: PERMISSION_DETAILS_SELECT,
      });

      return PermissionMapper.toDomainDetails(record);
    } catch (error) {
      throw new PermissionRepositoryError(
        'DB_WRITE_ERROR',
        'Failed to insert new permission record.',
        error
      );
    }
  }

  /**
   * Modifies columns on a permission.
   */
  public async updatePermission(
    id: string,
    data: UpdatePermissionData
  ): Promise<PermissionDetails> {
    try {
      const activeRecord = await this.findActivePermissionById(id);
      if (!activeRecord) {
        throw new PermissionRepositoryError(
          'RECORD_NOT_FOUND',
          `Permission with ID ${id} not found or inactive.`
        );
      }

      const record = await this.prisma.permission.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          module: data.module ? (data.module as PrismaModule) : undefined,
          resource: data.resource ? (data.resource as PrismaResource) : undefined,
          action: data.action ? (data.action as PrismaAction) : undefined,
          displayOrder: data.displayOrder,
          isActive: data.isActive,
        },
        select: PERMISSION_DETAILS_SELECT,
      });

      return PermissionMapper.toDomainDetails(record);
    } catch (error) {
      if (error instanceof PermissionRepositoryError) {
        throw error;
      }
      throw new PermissionRepositoryError(
        'DB_WRITE_ERROR',
        `Failed to update permission record with ID: ${id}`,
        error
      );
    }
  }

  /**
   * Marks a permission as soft-deleted in persistence.
   */
  public async softDeletePermission(id: string): Promise<boolean> {
    try {
      const activeRecord = await this.findActivePermissionById(id);
      if (!activeRecord) {
        return false;
      }

      await this.prisma.permission.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return true;
    } catch (error) {
      throw new PermissionRepositoryError(
        'DB_WRITE_ERROR',
        `Failed to soft-delete permission with ID: ${id}`,
        error
      );
    }
  }

  /**
   * Counts the number of active role mappings associated with a permission.
   */
  public async countRolesUsingPermission(permissionId: string): Promise<number> {
    try {
      return await this.prisma.rolePermission.count({
        where: {
          permissionId,
          isGranted: true,
          deletedAt: null,
        },
      });
    } catch (error) {
      throw new PermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to count role associations for permission ID: ${permissionId}`,
        error
      );
    }
  }

  /**
   * Helper lookup function to extract active records by ID.
   */
  private async findActivePermissionById(id: string): Promise<DbPermissionSummary | null> {
    return this.prisma.permission.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: PERMISSION_SUMMARY_SELECT,
    });
  }
}
