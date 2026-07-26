import { Prisma } from '@prisma/client';
import { USER_PROFILE_SELECT, USER_SUMMARY_SELECT } from '../repositories/user.repository.select';
import { UserProfile, UserSummary, UserRoleSummary } from '../types/user.types';

export type PrismaUserProfileResult = Prisma.UserGetPayload<{
  select: typeof USER_PROFILE_SELECT;
}>;

export type PrismaUserSummaryResult = Prisma.UserGetPayload<{
  select: typeof USER_SUMMARY_SELECT;
}>;

/**
 * User Module Data Mapper.
 * Strictly responsible for transforming raw database payloads into clean readonly domain types.
 */
export class UserMapper {
  /**
   * Converts a user role prisma assignment into a domain UserRoleSummary.
   */
  public static toRoleSummary(assignedRole: {
    readonly role: {
      readonly id: string;
      readonly name: string;
      readonly code: string;
    };
  }): UserRoleSummary {
    return {
      id: assignedRole.role.id,
      name: assignedRole.role.name,
      code: assignedRole.role.code,
    };
  }

  /**
   * Converts raw Prisma query output into a clean, readonly UserProfile domain object.
   */
  public static toUserProfile(prismaUser: PrismaUserProfileResult): UserProfile {
    return {
      id: prismaUser.id,
      firstName: prismaUser.firstName,
      middleName: prismaUser.middleName,
      lastName: prismaUser.lastName,
      displayName: prismaUser.displayName,
      email: prismaUser.email,
      phone: prismaUser.phone,
      avatarUrl: prismaUser.avatarUrl,
      emailVerified: prismaUser.emailVerified,
      phoneVerified: prismaUser.phoneVerified,
      status: prismaUser.status,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt,
      roles: prismaUser.assignedRoles.map((ar) => this.toRoleSummary(ar)),
    };
  }

  /**
   * Converts raw Prisma query output into a clean, readonly UserSummary domain object.
   */
  public static toUserSummary(prismaUser: PrismaUserSummaryResult): UserSummary {
    return {
      id: prismaUser.id,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      displayName: prismaUser.displayName,
      email: prismaUser.email,
      status: prismaUser.status,
      avatarUrl: prismaUser.avatarUrl,
      createdAt: prismaUser.createdAt,
      roles: prismaUser.assignedRoles.map((ar) => this.toRoleSummary(ar)),
    };
  }
}
