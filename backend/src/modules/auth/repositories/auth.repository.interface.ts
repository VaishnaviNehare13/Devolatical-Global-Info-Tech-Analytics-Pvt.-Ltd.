import { AuthenticatedUser, UserIdentity } from '../types/auth.types';

/**
 * Authentication Repository Interface contract.
 * Defines database operational boundaries for auth data management.
 */
export interface IAuthRepository {
  /**
   * Retrieves user credentials and roles for authentication by email.
   *
   * @param email The unique email address of the user
   * @returns User auth details or null if not found
   */
  findUserByEmail(email: string): Promise<AuthenticatedUser | null>;

  /**
   * Retrieves basic identity information of an authenticated user by ID.
   *
   * @param id User identifier
   * @returns User identity details or null if not found
   */
  findUserById(id: string): Promise<UserIdentity | null>;

  /**
   * Retrieves user credentials and roles for authentication by ID.
   *
   * @param id The user identifier
   * @returns User auth details or null if not found
   */
  findUserCredentialsById(id: string): Promise<AuthenticatedUser | null>;

  /**
   * Updates only the lastLoginAt timestamp of user credentials.
   *
   * @param userId User identifier
   * @returns Resolves when updated successfully
   */
  updateLastLogin(userId: string): Promise<void>;

  /**
   * Updates the password hash of a user.
   *
   * @param userId User identifier
   * @param passwordHash The new hashed password
   * @returns Resolves when updated successfully
   */
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  /**
   * Retrieves user MFA details from UserPreference.
   */
  getUserMfaDetails(userId: string): Promise<{
    twoFactorEnabled: boolean;
    totpSecret: string | null;
    totpTempSecret: string | null;
    totpEnabledAt: Date | null;
  } | null>;

  /**
   * Saves a temporary TOTP secret for MFA setup.
   */
  saveTempTotpSecret(userId: string, tempSecret: string): Promise<void>;

  /**
   * Enables MFA for user, copying temp secret to active TOTP secret.
   */
  enableMfa(userId: string, activeSecret: string): Promise<void>;

  /**
   * Disables MFA for user and wipes secrets.
   */
  disableMfa(userId: string): Promise<void>;
}

