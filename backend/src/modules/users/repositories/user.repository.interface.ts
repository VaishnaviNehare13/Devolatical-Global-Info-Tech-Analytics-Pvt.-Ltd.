import {
  UserProfile,
  UserSummary,
  UserStatus,
  UpdateProfileData,
  FindUsersOptions,
  PaginatedUsers,
} from '../types/user.types';

/**
 * User Repository contract interface.
 * Defines query boundaries for managing user-specific persistent states.
 */
export interface IUserRepository {
  /**
   * Finds a user profile by unique ID. Excludes soft-deleted records.
   *
   * @param userId The unique user identifier
   * @returns UserProfile object or null if not found
   */
  findProfileById(userId: string): Promise<UserProfile | null>;

  /**
   * Updates fields in the user profile. Excludes soft-deleted records.
   *
   * @param userId The unique user identifier
   * @param data Fields to update
   * @returns Updated UserProfile object or null if the user does not exist
   */
  updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile | null>;

  /**
   * Finds, filters, and paginates users.
   *
   * @param options Pagination, search, filtering, and sorting criteria
   * @returns Paginated list of UserSummary objects along with count metadata
   */
  findUsers(options: FindUsersOptions): Promise<PaginatedUsers>;

  /**
   * Finds a basic user summary by ID. Excludes soft-deleted records.
   *
   * @param userId The unique user identifier
   * @returns UserSummary object or null if not found
   */
  findUserById(userId: string): Promise<UserSummary | null>;

  /**
   * Updates user activation status. Excludes soft-deleted records.
   *
   * @param userId The unique user identifier
   * @param status The new status value
   * @returns Updated UserSummary object or null if the user does not exist
   */
  updateUserStatus(userId: string, status: UserStatus): Promise<UserSummary | null>;

  /**
   * Performs soft deletion of a user record. Marks deletedAt and sets status to ARCHIVED.
   *
   * @param userId The unique user identifier
   * @returns Boolean indicating whether deletion succeeded (false if user not found/already deleted)
   */
  softDeleteUser(userId: string): Promise<boolean>;

  /**
   * Retrieves or creates default user preferences.
   */
  findPreferencesByUserId(userId: string): Promise<any>;

  /**
   * Upserts user preferences.
   */
  updatePreferences(userId: string, data: any): Promise<any>;
}
