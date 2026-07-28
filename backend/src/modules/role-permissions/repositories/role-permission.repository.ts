import { PrismaClient, Prisma } from '@prisma/client';
import { IRolePermissionRepository } from './role-permission.repository.interface';
import {
  MappingDetails,
  FindMappingsOptions,
  PaginatedMappings,
} from '../types/role-permission.types';
import { RolePermissionRepositoryError } from '../types/role-permission.errors';
import { ROLE_PERMISSION_SELECT } from './role-permission.repository.select';

/**
 * Concrete implementation of IRolePermissionRepository using Prisma Client.
 * Responsible strictly for mapping table operations. Exposes no business, validation, or HTTP logic.
 */
export class RolePermissionRepository implements IRolePermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retrieves a paginated, sorted, and filtered list of role-permission mappings.
   */
  public async findMappings(options: FindMappingsOptions): Promise<PaginatedMappings> {
    try {
      const page = options.pagination?.page ?? 1;
      const limit = options.pagination?.limit ?? 10;
      const skip = (page - 1) * limit;

      const sortField = options.sorting?.field ?? 'createdAt';
      const sortOrder = options.sorting?.order ?? 'desc';
      const orderBy: Prisma.RolePermissionOrderByWithRelationInput = { [sortField]: sortOrder };

      const where: Prisma.RolePermissionWhereInput = {
        deletedAt: options.filters?.includeDeleted ? undefined : null,
      };

      if (options.filters?.roleId !== undefined) {
        where.roleId = options.filters.roleId;
      }

      if (options.filters?.permissionId !== undefined) {
        where.permissionId = options.filters.permissionId;
      }

      if (options.filters?.isGranted !== undefined) {
        where.isGranted = options.filters.isGranted;
      }

      if (options.search) {
        const searchPattern = options.search;
        where.OR = [
          { role: { name: { contains: searchPattern, mode: 'insensitive' } } },
          { role: { code: { contains: searchPattern, mode: 'insensitive' } } },
          { permission: { name: { contains: searchPattern, mode: 'insensitive' } } },
          { permission: { code: { contains: searchPattern, mode: 'insensitive' } } },
        ];
      }

      const [records, totalCount] = await Promise.all([
        this.prisma.rolePermission.findMany({
          where,
          select: ROLE_PERMISSION_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.rolePermission.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        items: records,
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_QUERY_ERROR',
        'Failed to query paginated mappings list.',
        error
      );
    }
  }

  /**
   * Finds a specific mapping by ID.
   */
  public async findMappingById(id: string): Promise<MappingDetails | null> {
    try {
      const record = await this.prisma.rolePermission.findUnique({
        where: { id },
        select: ROLE_PERMISSION_SELECT,
      });

      return record;
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to retrieve mapping by ID: ${id}`,
        error
      );
    }
  }

  /**
   * Finds a mapping by unique combination of roleId and permissionId.
   */
  public async findMappingByRoleAndPermission(
    roleId: string,
    permissionId: string
  ): Promise<MappingDetails | null> {
    try {
      const record = await this.prisma.rolePermission.findFirst({
        where: {
          roleId,
          permissionId,
        },
        select: ROLE_PERMISSION_SELECT,
      });

      return record;
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to retrieve mapping for role ID "${roleId}" and permission ID "${permissionId}"`,
        error
      );
    }
  }

  /**
   * Creates role-permission mappings in bulk.
   */
  public async createMappingsBulk(
    roleId: string,
    permissionIds: string[],
    isGranted: boolean
  ): Promise<MappingDetails[]> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const records: MappingDetails[] = [];

        for (const permissionId of permissionIds) {
          const record = await tx.rolePermission.create({
            data: {
              roleId,
              permissionId,
              isGranted,
            },
            select: ROLE_PERMISSION_SELECT,
          });
          records.push(record);
        }

        return records;
      });
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_WRITE_ERROR',
        'Failed to create bulk mappings.',
        error
      );
    }
  }

  /**
   * Updates the isGranted status on a specific mapping.
   */
  public async updateMapping(id: string, isGranted: boolean): Promise<MappingDetails> {
    try {
      const record = await this.prisma.rolePermission.update({
        where: { id },
        data: {
          isGranted,
          deletedAt: null, // Ensure it is active
        },
        select: ROLE_PERMISSION_SELECT,
      });

      return record;
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_WRITE_ERROR',
        `Failed to update mapping with ID: ${id}`,
        error
      );
    }
  }

  /**
   * Performs soft deletion of mapping associations.
   */
  public async deleteMapping(roleId: string, permissionId: string): Promise<boolean> {
    try {
      const mapping = await this.prisma.rolePermission.findFirst({
        where: {
          roleId,
          permissionId,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!mapping) {
        return false;
      }

      await this.prisma.rolePermission.update({
        where: { id: mapping.id },
        data: {
          deletedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_WRITE_ERROR',
        `Failed to delete mapping for role ID "${roleId}" and permission ID "${permissionId}"`,
        error
      );
    }
  }

  /**
   * Checks if a mapping exists for the given combination of roleId and permissionId.
   */
  public async existsRolePermission(roleId: string, permissionId: string): Promise<boolean> {
    try {
      const record = await this.prisma.rolePermission.findFirst({
        where: {
          roleId,
          permissionId,
          deletedAt: null,
        },
        select: { id: true },
      });

      return record !== null;
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to verify mapping existence for role ID "${roleId}" and permission ID "${permissionId}"`,
        error
      );
    }
  }

  /**
   * Restores a soft-deleted mapping to active status.
   */
  public async restoreMapping(id: string, isGranted: boolean): Promise<MappingDetails> {
    try {
      const record = await this.prisma.rolePermission.update({
        where: { id },
        data: {
          isGranted,
          deletedAt: null,
        },
        select: ROLE_PERMISSION_SELECT,
      });

      return record;
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_WRITE_ERROR',
        `Failed to restore soft-deleted mapping with ID: ${id}`,
        error
      );
    }
  }

  /**
   * Counts active mappings currently associated with a role.
   */
  public async countActiveMappingsForRole(roleId: string): Promise<number> {
    try {
      return await this.prisma.rolePermission.count({
        where: {
          roleId,
          deletedAt: null,
          isGranted: true,
        },
      });
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_QUERY_ERROR',
        `Failed to count active mappings for role ID: ${roleId}`,
        error
      );
    }
  }

  /**
   * Executes bulk assignments transactionally (handling exists/active/soft-deleted records).
   */
  public async assignPermissionsBulk(
    roleId: string,
    permissionIds: string[],
    isGranted: boolean
  ): Promise<MappingDetails[]> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const results: MappingDetails[] = [];

        for (const permissionId of permissionIds) {
          // Find existing mapping (including soft-deleted ones)
          const existing = await tx.rolePermission.findFirst({
            where: {
              roleId,
              permissionId,
            },
            select: ROLE_PERMISSION_SELECT,
          });

          if (existing) {
            if (existing.deletedAt === null) {
              if (existing.isGranted !== isGranted) {
                const updated = await tx.rolePermission.update({
                  where: { id: existing.id },
                  data: { isGranted },
                  select: ROLE_PERMISSION_SELECT,
                });
                results.push(updated);
              } else {
                results.push(existing);
              }
            } else {
              // Restore mapping
              const restored = await tx.rolePermission.update({
                where: { id: existing.id },
                data: {
                  deletedAt: null,
                  isGranted,
                },
                select: ROLE_PERMISSION_SELECT,
              });
              results.push(restored);
            }
          } else {
            // Create new mapping
            const created = await tx.rolePermission.create({
              data: {
                roleId,
                permissionId,
                isGranted,
              },
              select: ROLE_PERMISSION_SELECT,
            });
            results.push(created);
          }
        }

        return results;
      });
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_WRITE_ERROR',
        'Failed to bulk assign permissions.',
        error
      );
    }
  }

  /**
   * Executes permission synchronization transactionally (soft-deleting missing mappings and restoring/creating matching ones).
   */
  public async replacePermissionsTransaction(
    roleId: string,
    permissionIds: string[],
    isGranted: boolean
  ): Promise<MappingDetails[]> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Soft-delete all active mappings for this role that are NOT in the supplied list
        await tx.rolePermission.updateMany({
          where: {
            roleId,
            deletedAt: null,
            permissionId: {
              notIn: permissionIds,
            },
          },
          data: {
            deletedAt: new Date(),
          },
        });

        // 2. Perform bulk assignment (assign/restore/create) for the supplied list
        const results: MappingDetails[] = [];

        for (const permissionId of permissionIds) {
          const existing = await tx.rolePermission.findFirst({
            where: {
              roleId,
              permissionId,
            },
            select: ROLE_PERMISSION_SELECT,
          });

          if (existing) {
            if (existing.deletedAt === null) {
              if (existing.isGranted !== isGranted) {
                const updated = await tx.rolePermission.update({
                  where: { id: existing.id },
                  data: { isGranted },
                  select: ROLE_PERMISSION_SELECT,
                });
                results.push(updated);
              } else {
                results.push(existing);
              }
            } else {
              const restored = await tx.rolePermission.update({
                where: { id: existing.id },
                data: {
                  deletedAt: null,
                  isGranted,
                },
                select: ROLE_PERMISSION_SELECT,
              });
              results.push(restored);
            }
          } else {
            const created = await tx.rolePermission.create({
              data: {
                roleId,
                permissionId,
                isGranted,
              },
              select: ROLE_PERMISSION_SELECT,
            });
            results.push(created);
          }
        }

        return results;
      });
    } catch (error) {
      throw new RolePermissionRepositoryError(
        'DB_WRITE_ERROR',
        'Failed to replace permissions for role.',
        error
      );
    }
  }
}
