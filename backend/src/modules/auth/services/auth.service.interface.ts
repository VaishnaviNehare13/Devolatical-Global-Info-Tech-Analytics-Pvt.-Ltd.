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

  /**
   * Initiates password recovery process.
   * Generates reset token and dispatches recovery email.
   *
   * @param email Plain text user email address
   */
  forgotPassword(email: string): Promise<void>;

  /**
   * Executes password resets using short-lived recovery tokens.
   *
   * @param resetToken Signed JWT reset token
   * @param newPassword Plain text user password
   */
  resetPassword(resetToken: string, newPassword: string): Promise<void>;

  /**
   * Updates credentials password for authenticated sessions.
   *
   * @param userId The unique user identifier
   * @param currentPassword Current plain text password
   * @param newPassword The new plain text password
   */
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;

  /**
   * Generates a new pending TOTP secret and setup QR code for MFA setup.
   */
  setupMfa(userId: string): Promise<{ secret: string; otpauthUrl: string; qrCodeUrl: string }>;

  /**
   * Verifies TOTP code against pending secret and activates MFA.
   */
  verifyAndEnableMfa(userId: string, code: string): Promise<{ enabled: boolean }>;

  /**
   * Disables MFA for user account.
   */
  disableMfa(userId: string, password?: string, code?: string): Promise<{ enabled: boolean }>;

  /**
   * Retrieves MFA status for user account.
   */
  getMfaStatus(userId: string): Promise<{ enabled: boolean; enabledAt: string | null }>;

  /**
   * Completes login by verifying short-lived MFA challenge token & TOTP code.
   */
  verifyMfaLogin(mfaToken: string, code: string): Promise<LoginResult>;
}

