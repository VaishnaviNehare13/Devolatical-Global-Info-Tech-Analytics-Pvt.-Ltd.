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
   * Retrieves user credentials and roles for authentication by ID.
   *
   * @param id User identifier
   * @returns User auth details or null if not found
   * @throws {RepositoryError} If database read fails
   */
  public async findUserCredentialsById(id: string): Promise<AuthenticatedUser | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { id },
        select: AUTH_USER_SELECT,
      });

      if (!result) {
        return null;
      }

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
        'Database query failed while retrieving user credentials by ID.',
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

  /**
   * Updates the password hash of a user.
   *
   * @param userId User identifier
   * @param passwordHash The new hashed password
   * @throws {RepositoryError} If database update fails
   */
  public async updatePassword(userId: string, passwordHash: string): Promise<void> {
    try {
      await prisma.credential.update({
        where: { userId },
        data: {
          passwordHash,
        },
        select: { id: true },
      });
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_UPDATE_FAILED',
        'Database write failed while updating user password hash.',
        error
      );
    }
  }

  public async getUserMfaDetails(userId: string) {
    try {
      const pref = await prisma.userPreference.findUnique({
        where: { userId },
        select: {
          twoFactorEnabled: true,
          totpSecret: true,
          totpTempSecret: true,
          totpEnabledAt: true,
        },
      });
      return pref;
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_READ_FAILED',
        'Database query failed while retrieving user MFA details.',
        error
      );
    }
  }

  public async saveTempTotpSecret(userId: string, tempSecret: string): Promise<void> {
    try {
      await prisma.userPreference.upsert({
        where: { userId },
        create: {
          userId,
          totpTempSecret: tempSecret,
        },
        update: {
          totpTempSecret: tempSecret,
        },
      });
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_UPDATE_FAILED',
        'Database write failed while saving temporary TOTP secret.',
        error
      );
    }
  }

  public async enableMfa(userId: string, activeSecret: string): Promise<void> {
    try {
      await prisma.userPreference.update({
        where: { userId },
        data: {
          twoFactorEnabled: true,
          totpSecret: activeSecret,
          totpTempSecret: null,
          totpEnabledAt: new Date(),
        },
      });
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_UPDATE_FAILED',
        'Database write failed while enabling MFA.',
        error
      );
    }
  }

  public async disableMfa(userId: string): Promise<void> {
    try {
      await prisma.userPreference.update({
        where: { userId },
        data: {
          twoFactorEnabled: false,
          totpSecret: null,
          totpTempSecret: null,
          totpEnabledAt: null,
        },
      });
    } catch (error) {
      throw new RepositoryError(
        'DATABASE_UPDATE_FAILED',
        'Database write failed while disabling MFA.',
        error
      );
    }
  }
}

