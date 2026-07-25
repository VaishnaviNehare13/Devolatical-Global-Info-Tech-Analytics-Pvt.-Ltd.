import { LoginResult } from '../types/auth.service.types';

/**
 * Authentication Business Service Contract
 */
export interface IAuthService {
  /**
   * Executes the authentication login flow.
   *
   * @param email The user plain text email
   * @param password The user plain text password
   * @returns Strongly typed login result with token pair and identity
   */
  login(email: string, password: string): Promise<LoginResult>;
}
