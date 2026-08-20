import { UserStatus } from '@prisma/client';

/**
 * Clean data model for authenticated user identity (Readonly)
 */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly status: UserStatus;
  readonly roles: readonly string[];
}

/**
 * Result structure returned by authentication services (Readonly)
 */
export interface LoginResult {
  readonly mfaRequired?: boolean;
  readonly mfaToken?: string;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly user?: AuthUser;
}

