import { UserStatus } from '@prisma/client';
export { UserStatus };

/**
 * Reusable User Role Contract for Authentication (Readonly)
 */
export interface UserRole {
  readonly id: string;
  readonly name: string;
}

/**
 * Encapsulated user information returned upon successful search by email (Readonly)
 */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly status: UserStatus;
  readonly passwordHash: string;
  readonly lastLoginAt: Date | null;
  readonly roles: readonly UserRole[];
}

/**
 * Basic user identity contract returned upon retrieval by ID (Readonly)
 */
export interface UserIdentity {
  readonly id: string;
  readonly email: string;
  readonly status: UserStatus;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
}
