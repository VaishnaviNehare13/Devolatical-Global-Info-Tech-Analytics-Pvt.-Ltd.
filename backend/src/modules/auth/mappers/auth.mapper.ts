import { UserStatus } from '@prisma/client';
import { UserRole } from '../types/auth.types';
import { AuthUser, LoginResult } from '../types/auth.service.types';

/**
 * Interface representing a user object that can be converted by the AuthMapper.
 * Integrates both repository-level AuthenticatedUser and UserIdentity.
 */
export interface MappableUser {
  readonly id: string;
  readonly email: string;
  readonly status: UserStatus;
  readonly roles: readonly UserRole[];
}

/**
 * Authentication Data Mapper.
 * Responsible strictly for transforming objects between layers.
 */
export class AuthMapper {
  /**
   * Converts a repository-level user model into a service-level AuthUser.
   *
   * @param user Mappable user model containing roles
   * @returns Readonly AuthUser model for service layer
   */
  public static toAuthUser(user: MappableUser): AuthUser {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.roles.map((r) => r.name),
    };
  }

  /**
   * Converts authentication tokens and user information into LoginResult.
   *
   * @param accessToken Access token string
   * @param refreshToken Refresh token string
   * @param user Mappable user model containing roles
   * @returns Readonly LoginResult model
   */
  public static toLoginResult(
    accessToken: string,
    refreshToken: string,
    user: MappableUser
  ): LoginResult {
    return {
      accessToken,
      refreshToken,
      user: this.toAuthUser(user),
    };
  }

  public static toMfaChallengeResult(mfaToken: string): LoginResult {
    return {
      mfaRequired: true,
      mfaToken,
    };
  }
}

