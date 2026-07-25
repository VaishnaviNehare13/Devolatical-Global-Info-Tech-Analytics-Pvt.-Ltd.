import { LoginResult } from '../types/auth.service.types';

/**
 * Authentication Business Service Contract
 */
export interface IAuthService {
  /**
   * Executes the credentials login flow.
   *
   * @param email Plain text user email
   * @param password Plain text user password
   * @returns Strongly typed login result with token pair and identity
   */
  login(email: string, password: string): Promise<LoginResult>;

  /**
   * Executes token refresh and rotation flow.
   *
   * @param token Refresh token string
   * @returns Strongly typed login result with rotated token pair and identity
   */
  refreshToken(token: string): Promise<LoginResult>;

  /**
   * Terminates user sessions and triggers necessary token revocations.
   *
   * @param userId The unique user identifier
   */
  logout(userId: string): Promise<void>;
}
