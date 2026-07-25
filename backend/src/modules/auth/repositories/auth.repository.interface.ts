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
}
