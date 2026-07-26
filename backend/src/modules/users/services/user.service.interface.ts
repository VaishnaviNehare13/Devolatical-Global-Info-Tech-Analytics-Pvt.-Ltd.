import {
  UserProfile,
  UserSummary,
  UserStatus,
  UpdateProfileData,
  FindUsersOptions,
  PaginatedUsers,
} from '../types/user.types';

/**
 * Service Contract for managing User Profile business logic.
 * Exposes safe readonly types and operations.
 */
export interface IUserService {
  /**
   * Retrieves the profile details of the current authenticated user.
   *
   * @param userId The unique user identifier
   * @returns UserProfile details
   * @throws {UserNotFoundError} If user profile does not exist
   * @throws {UserServiceError} If repository database access fails
   */
  getMyProfile(userId: string): Promise<UserProfile>;

  /**
   * Updates profile fields of the current user.
   *
   * @param userId The unique user identifier
   * @param data Profile fields to update
   * @returns Updated UserProfile details
   * @throws {UserNotFoundError} If user profile does not exist
   * @throws {UserServiceError} If repository database access fails
   */
  updateMyProfile(userId: string, data: UpdateProfileData): Promise<UserProfile>;

  /**
   * Retrieves, filters, and paginates user records.
   *
   * @param options Query, filter, and pagination options
   * @returns Paginated result list of UserSummary items
   * @throws {UserServiceError} If repository database access fails
   */
  getUsers(options: FindUsersOptions): Promise<PaginatedUsers>;

  /**
   * Retrieves the summary details of any active user by ID.
   *
   * @param userId The unique user identifier
   * @returns UserSummary details
   * @throws {UserNotFoundError} If user does not exist
   * @throws {UserServiceError} If repository database access fails
   */
  getUserById(userId: string): Promise<UserSummary>;

  /**
   * Updates the operational status of an active user.
   * Enforces business status transition validation rules.
   *
   * @param userId The unique user identifier
   * @param status The new status value to apply
   * @returns Updated UserSummary details
   * @throws {UserNotFoundError} If user does not exist
   * @throws {InvalidUserStatusError} If status change violates transition rules
   * @throws {UserServiceError} If repository database access fails
   */
  updateUserStatus(userId: string, status: UserStatus): Promise<UserSummary>;

  /**
   * Soft-deletes a user account.
   * Blocks operations on protected/root system accounts.
   *
   * @param userId The unique user identifier to soft-delete
   * @throws {UserNotFoundError} If user does not exist
   * @throws {ProtectedUserError} If user is a protected admin account
   * @throws {UserServiceError} If repository database access fails
   */
  softDeleteUser(userId: string): Promise<void>;
}
