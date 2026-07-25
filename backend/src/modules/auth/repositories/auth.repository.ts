import { prisma } from '../../../config';
import { AuthenticatedUser, UserIdentity } from '../types/auth.types';
import { RepositoryError } from '../types/auth.errors';
import { IAuthRepository } from './auth.repository.interface';
import { AUTH_USER_SELECT, USER_IDENTITY_SELECT } from './auth.repository.select';

/**
 * Concrete Authentication Repository implementing IAuthRepository.
 * Handles database operations using centralized selects and wraps database-specific
 * errors in abstract repository errors.
 */
export class AuthRepository implements IAuthRepository {
  /**
   * Retrieves user credentials and roles for authentication by email.
   * Uses centralized select definitions to maintain schema isolation.
   *
   * @param email User email
   * @returns Mapped AuthenticatedUser details, or null if not found
   * @throws {RepositoryError} If database read fails
   */
  public async findUserByEmail(email: string): Promise<AuthenticatedUser | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { email },
        select: AUTH_USER_SELECT,
      });

      if (!result) {
        return null;
      }

      // Map to application-specific read-only types
      return {
        id: result.id,
        email: result.email,
        status: result.status,
        passwordHash: result.credentials?.passwordHash || '',
        lastLoginAt: result.credentials?.lastLoginAt || null,
        roles: result.assignedRoles.map((userRole) => ({
          id: userRole.role.id,
          name: userRole.role.name,
        })),
      };
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_READ_FAILED',
        'Database query failed while retrieving user credentials by email.',
        error
      );
    }
  }

  /**
   * Retrieves basic identity information of an authenticated user by ID.
   * Uses centralized select definitions to retrieve identification fields.
   *
   * @param id User identifier
   * @returns Mapped UserIdentity details, or null if not found
   * @throws {RepositoryError} If database read fails
   */
  public async findUserById(id: string): Promise<UserIdentity | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { id },
        select: USER_IDENTITY_SELECT,
      });

      if (!result) {
        return null;
      }

      return {
        id: result.id,
        email: result.email,
        status: result.status,
        firstName: result.firstName,
        lastName: result.lastName,
        displayName: result.displayName,
        roles: result.assignedRoles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
        })),
      };
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_READ_FAILED',
        'Database query failed while retrieving user identity by ID.',
        error
      );
    }
  }

  /**
   * Updates only the lastLoginAt timestamp of user credentials.
   *
   * @param userId User identifier
   * @throws {RepositoryError} If database update fails
   */
  public async updateLastLogin(userId: string): Promise<void> {
    try {
      await prisma.credential.update({
        where: { userId },
        data: {
          lastLoginAt: new Date(),
        },
        select: { id: true },
      });
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_UPDATE_FAILED',
        'Database write failed while updating user last login timestamp.',
        error
      );
    }
  }
}
