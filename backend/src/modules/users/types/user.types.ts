import { UserStatus } from '@prisma/client';
export { UserStatus };

/**
 * Reusable User Role Summary Contract for public outputs (Readonly)
 */
export interface UserRoleSummary {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

/**
 * Enterprise User Profile Contract (Readonly)
 */
export interface UserProfile {
  readonly id: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly displayName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly avatarUrl: string | null;
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly roles: readonly UserRoleSummary[];
}

/**
 * Enterprise User Summary Contract (Readonly)
 */
export interface UserSummary {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly email: string;
  readonly status: UserStatus;
  readonly avatarUrl: string | null;
  readonly createdAt: Date;
  readonly roles: readonly UserRoleSummary[];
}

/**
 * Profile Update Payload (Readonly)
 */
export interface UpdateProfileData {
  readonly firstName?: string;
  readonly middleName?: string | null;
  readonly lastName?: string;
  readonly displayName?: string;
  readonly phone?: string | null;
  readonly avatarUrl?: string | null;
}

/**
 * Structured query options for finding users, including pagination, filtering, searching, and sorting.
 */
export interface FindUsersOptions {
  readonly pagination?: {
    readonly page?: number;
    readonly limit?: number;
  };
  readonly search?: string;
  readonly filters?: {
    readonly status?: UserStatus;
    readonly roleId?: string;
    readonly includeDeleted?: boolean;
  };
  readonly sorting?: {
    readonly field?: 'createdAt' | 'displayName' | 'email';
    readonly order?: 'asc' | 'desc';
  };
}

/**
 * Paginated Users response structure (Readonly)
 */
export interface PaginatedUsers {
  readonly items: readonly UserSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly pages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}
