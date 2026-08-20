import { PrismaClient, Prisma } from '@prisma/client';
import { IUserRepository } from './user.repository.interface';
import {
  USER_PROFILE_SELECT,
  USER_SUMMARY_SELECT,
  USER_LIST_SELECT,
} from './user.repository.select';
import {
  UserProfile,
  UserSummary,
  UserStatus,
  UpdateProfileData,
  FindUsersOptions,
  PaginatedUsers,
} from '../types/user.types';
import { UserMapper } from '../mappers/user.mapper';
import { RepositoryError } from '../types/user.errors';
import { USER_PAGINATION, USER_SORT } from '../constants/user.constants';

/**
 * Concrete Prisma-based User Repository implementation.
 * Encapsulates database actions for User module and wraps errors.
 */
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retrieves a UserProfile by unique ID if not soft deleted.
   */
  public async findProfileById(userId: string): Promise<UserProfile | null> {
    try {
      const result = await this.prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
        },
        select: USER_PROFILE_SELECT,
      });

      return result ? UserMapper.toUserProfile(result) : null;
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching user profile for ID ${userId}.`,
        error
      );
    }
  }

  /**
   * Updates profile fields of an active user.
   */
  public async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile | null> {
    try {
      const userExists = await this.findActiveUserById(userId);
      if (!userExists) {
        return null;
      }

      const result = await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          displayName: data.displayName,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
        },
        select: USER_PROFILE_SELECT,
      });

      return UserMapper.toUserProfile(result);
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating user profile for ID ${userId}.`,
        error
      );
    }
  }

  /**
   * Searches, filters, and paginates users.
   */
  public async findUsers(options: FindUsersOptions): Promise<PaginatedUsers> {
    try {
      const page = Math.max(1, options.pagination?.page ?? USER_PAGINATION.DEFAULT_PAGE);
      const rawLimit = options.pagination?.limit ?? USER_PAGINATION.DEFAULT_LIMIT;
      const limit = Math.min(USER_PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderBy(options);

      const [total, items] = await Promise.all([
        this.prisma.user.count({ where }),
        this.prisma.user.findMany({
          where,
          select: USER_LIST_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        items: items.map((item) => UserMapper.toUserSummary(item)),
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrevious: page > 1,
      };
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_READ_FAILED',
        'Database query failed while fetching paginated users list.',
        error
      );
    }
  }

  /**
   * Retrieves basic user summary by ID if not soft deleted.
   */
  public async findUserById(userId: string): Promise<UserSummary | null> {
    try {
      const result = await this.prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
        },
        select: USER_SUMMARY_SELECT,
      });

      return result ? UserMapper.toUserSummary(result) : null;
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching user summary for ID ${userId}.`,
        error
      );
    }
  }

  /**
   * Updates status of an active user.
   */
  public async updateUserStatus(userId: string, status: UserStatus): Promise<UserSummary | null> {
    try {
      const userExists = await this.findActiveUserById(userId);
      if (!userExists) {
        return null;
      }

      const result = await this.prisma.user.update({
        where: { id: userId },
        data: { status },
        select: USER_SUMMARY_SELECT,
      });

      return UserMapper.toUserSummary(result);
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating user status for ID ${userId}.`,
        error
      );
    }
  }

  /**
   * Marks a user as soft deleted by setting deletedAt and setting status to ARCHIVED.
   */
  public async softDeleteUser(userId: string): Promise<boolean> {
    try {
      const userExists = await this.findActiveUserById(userId);
      if (!userExists) {
        return false;
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          status: UserStatus.ARCHIVED,
        },
        select: { id: true },
      });

      return true;
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_DELETE_FAILED',
        `Database update failed while soft-deleting user with ID ${userId}.`,
        error
      );
    }
  }

  /**
   * Retrieves or creates default user preferences for a user.
   */
  public async findPreferencesByUserId(userId: string): Promise<any> {
    try {
      let pref = await this.prisma.userPreference.findUnique({
        where: { userId },
      });
      if (!pref) {
        pref = await this.prisma.userPreference.create({
          data: { userId },
        });
      }
      return pref;
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching preferences for user ${userId}.`,
        error
      );
    }
  }

  /**
   * Upserts preferences for a user.
   */
  public async updatePreferences(userId: string, data: any): Promise<any> {
    try {
      return await this.prisma.userPreference.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      });
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while upserting preferences for user ${userId}.`,
        error
      );
    }
  }

  /**
   * Helper to retrieve active user by ID.
   */
  private async findActiveUserById(userId: string): Promise<{ readonly id: string } | null> {
    return this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
  }

  /**
   * Prepares the Prisma `where` clause according to query criteria.
   */
  private buildWhereClause(options: FindUsersOptions): Prisma.UserWhereInput {
    const filters = options.filters || {};
    const search = options.search;

    const searchConditions = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const roleConditions = filters.roleId
      ? {
          assignedRoles: {
            some: {
              roleId: filters.roleId,
              isActive: true,
            },
          },
        }
      : {};

    return {
      deletedAt: filters.includeDeleted ? undefined : null,
      ...(filters.status ? { status: filters.status } : {}),
      ...searchConditions,
      ...roleConditions,
    };
  }

  /**
   * Prepares the Prisma `orderBy` clause according to options.
   */
  private buildOrderBy(options: FindUsersOptions): Prisma.UserOrderByWithRelationInput {
    const sorting = options.sorting || {};
    const field =
      sorting.field && USER_SORT.ALLOWED_FIELDS.includes(sorting.field)
        ? sorting.field
        : 'createdAt';
    const order = sorting.order === 'asc' ? 'asc' : 'desc';

    return {
      [field]: order,
    };
  }
}
