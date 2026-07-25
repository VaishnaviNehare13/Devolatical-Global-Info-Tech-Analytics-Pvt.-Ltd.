import { AuthenticatedUser } from '../types/auth.types';
import { AuthUser, LoginResult } from '../types/auth.service.types';

/**
 * Authentication Data Mapper.
 * Responsible strictly for transforming objects between layers.
 * Contains no business logic, database queries, JWT generation, or password comparison.
 */
export class AuthMapper {
  /**
   * Converts a repository-level AuthenticatedUser into a service-level AuthUser.
   *
   * @param user The repository authenticated user object
   * @returns Readonly AuthUser model for service layer
   */
  public static toAuthUser(user: AuthenticatedUser): AuthUser {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
    };
  }

  /**
   * Converts authentication tokens and user information into LoginResult.
   *
   * @param accessToken Access token string
   * @param refreshToken Refresh token string
   * @param user The repository authenticated user object
   * @returns Readonly LoginResult model
   */
  public static toLoginResult(
    accessToken: string,
    refreshToken: string,
    user: AuthenticatedUser
  ): LoginResult {
    return {
      accessToken,
      refreshToken,
      user: this.toAuthUser(user),
    };
  }
}
