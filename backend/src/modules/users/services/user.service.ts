import { IUserRepository } from '../repositories/user.repository.interface';
import { IUserService } from './user.service.interface';
import { RepositoryError } from '../types/user.errors';
import {
  UserProfile,
  UserSummary,
  UserStatus,
  UpdateProfileData,
  FindUsersOptions,
  PaginatedUsers,
} from '../types/user.types';
import {
  UserNotFoundError,
  InvalidUserStatusError,
  ProtectedUserError,
  UserServiceError,
} from '../types/user.service.errors';
import { USER_SYSTEM, ALLOWED_STATUS_TRANSITIONS } from '../constants/user.constants';

/**
 * Service Layer implementation for User profiles and metadata operations.
 * Coordinates user repositories and enforces domain rules.
 */
export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Retrieves profile details of the current authenticated user.
   */
  public async getMyProfile(userId: string): Promise<UserProfile> {
    try {
      const profile = await this.userRepository.findProfileById(userId);
      if (!profile) {
        throw new UserNotFoundError(`Profile for user with ID ${userId} was not found.`);
      }
      return profile;
    } catch (error) {
      this.handleError(error, `Failed to retrieve profile for user ${userId}.`);
    }
  }

  /**
   * Updates profile fields of the current user.
   * Optimizes DB execution by executing a direct update.
   */
  public async updateMyProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
    try {
      const updatedProfile = await this.userRepository.updateProfile(userId, data);
      if (!updatedProfile) {
        throw new UserNotFoundError(`Profile for user with ID ${userId} was not found.`);
      }

      return updatedProfile;
    } catch (error) {
      this.handleError(error, `Failed to update profile for user ${userId}.`);
    }
  }

  /**
   * Searches, filters, and paginates users list.
   */
  public async getUsers(options: FindUsersOptions): Promise<PaginatedUsers> {
    try {
      return await this.userRepository.findUsers(options);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve paginated users list.');
    }
  }

  /**
   * Retrieves user summary details by ID.
   */
  public async getUserById(userId: string): Promise<UserSummary> {
    try {
      const summary = await this.userRepository.findUserById(userId);
      if (!summary) {
        throw new UserNotFoundError(`Summary for user with ID ${userId} was not found.`);
      }
      return summary;
    } catch (error) {
      this.handleError(error, `Failed to retrieve user summary for ID ${userId}.`);
    }
  }

  /**
   * Updates the status of an active user.
   * Validates status transitions against the business rules transition matrix.
   */
  public async updateUserStatus(userId: string, status: UserStatus): Promise<UserSummary> {
    try {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new UserNotFoundError(`User with ID ${userId} was not found.`);
      }

      this.validateStatusTransition(user.status, status);

      const updatedUser = await this.userRepository.updateUserStatus(userId, status);
      if (!updatedUser) {
        throw new UserNotFoundError(`User with ID ${userId} was not found.`);
      }

      return updatedUser;
    } catch (error) {
      this.handleError(error, `Failed to update status for user ${userId}.`);
    }
  }

  /**
   * Soft-deletes a user by ID.
   * Enforces business rule to protect root Super Admins from lockout.
   */
  public async softDeleteUser(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new UserNotFoundError(`User with ID ${userId} was not found.`);
      }

      if (this.isProtectedAccount(user)) {
        throw new ProtectedUserError(
          `User with ID ${userId} is a protected system account and cannot be deleted.`
        );
      }

      const success = await this.userRepository.softDeleteUser(userId);
      if (!success) {
        throw new UserNotFoundError(`User with ID ${userId} was not found.`);
      }
    } catch (error) {
      this.handleError(error, `Failed to soft delete user ${userId}.`);
    }
  }

  /**
   * Checks if a user is a protected system account (e.g., the bootstrap super admin
   * or any account holding the Super Admin role).
   *
   * WHY: Protected accounts must not be deleted to prevent locking out all system administrators
   * or deleting the primary system configuration agent.
   */
  private isProtectedAccount(user: UserSummary): boolean {
    return (
      user.roles.some((r) => r.code === USER_SYSTEM.SUPER_ADMIN_ROLE_CODE) ||
      user.email === USER_SYSTEM.ROOT_ADMIN_EMAIL
    );
  }

  /**
   * Validates that a user status change is allowed by business policy.
   *
   * WHY: Centralized validation via transition matrix checks if the target status is allowed
   * from the current status, decoupling conditional rules from the method flow and future-proofing state changes.
   */
  private validateStatusTransition(currentStatus: UserStatus, newStatus: UserStatus): void {
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new InvalidUserStatusError(
        `Cannot change status from ${currentStatus} to ${newStatus}. Transition is not permitted.`
      );
    }
  }

  /**
   * Helper to ensure RepositoryErrors are translated and wrapped, while letting runtime errors bubble up.
   */
  private handleError(error: unknown, fallbackMessage: string): never {
    if (error instanceof UserServiceError) {
      throw error;
    }
    if (error instanceof RepositoryError) {
      throw new UserServiceError('USER_SERVICE_FAILED', fallbackMessage, error);
    }
    throw error;
  }
}
