import type { StringValue } from 'ms';

/**
 * JWT Type Definitions
 *
 * Centralizes all interfaces, enums, and types relating to JWT payload claims,
 * error handling, and token verification outputs.
 */

export type TokenType = 'ACCESS' | 'REFRESH' | 'RESET';

export type JwtExpiresIn = StringValue | number;

export interface BaseJwtPayload {
  sub: string; // User Identity ID (Subject claim)
  email: string; // User Email claim
  type: TokenType; // Identity token classification claim
}

export type AccessTokenPayload = BaseJwtPayload;

export interface RefreshTokenPayload extends BaseJwtPayload {
  tokenVersion?: number; // Optional token version identifier
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type JwtErrorCode = 'INVALID' | 'EXPIRED' | 'MALFORMED' | 'UNSUPPORTED';

export type JwtVerifyResult<T> =
  { success: true; payload: T } | { success: false; error: JwtErrorCode };
