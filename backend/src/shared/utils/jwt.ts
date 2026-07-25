import { jwtConfig } from '../../config/jwt.config';
import { JWT_CONSTANTS } from '../constants/jwt.constants';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  JwtVerifyResult,
  BaseJwtPayload,
} from '../types/jwt.types';
import { signToken, verifyToken, decodeToken as decodeTokenHelper } from './jwt.helpers';

/**
 * Public JWT Infrastructure API
 *
 * Provides unified, domain-specific utilities for generating and validating
 * identity tokens. Delegates low-level cryptography to jwt.helpers.ts.
 */

/**
 * Generates an Access Token for identity verification.
 *
 * @param payload Identity claims (sub, email)
 * @returns Signed JWT access token
 */
export function generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const claims = {
    ...payload,
    type: JWT_CONSTANTS.TOKEN_TYPES.ACCESS,
  };

  return signToken(claims, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithm: jwtConfig.algorithm,
  });
}

/**
 * Generates a Refresh Token for session management.
 *
 * @param payload Identity claims (sub, email)
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  const claims = {
    ...payload,
    type: JWT_CONSTANTS.TOKEN_TYPES.REFRESH,
  };

  return signToken(claims, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithm: jwtConfig.algorithm,
  });
}

/**
 * Verifies and decodes an Access Token.
 * Enforces token classification safety (prevents refresh tokens from acting as access tokens).
 *
 * @param token JWT token string
 * @returns Type-safe verification result
 */
export function verifyAccessToken(token: string): JwtVerifyResult<AccessTokenPayload> {
  const result = verifyToken<AccessTokenPayload>(token, jwtConfig.access.secret, {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithms: [jwtConfig.algorithm],
  });

  if (result.success && result.payload.type !== JWT_CONSTANTS.TOKEN_TYPES.ACCESS) {
    return {
      success: false,
      error: 'INVALID',
    };
  }

  return result;
}

/**
 * Verifies and decodes a Refresh Token.
 * Enforces token classification safety (prevents access tokens from acting as refresh tokens).
 *
 * @param token JWT token string
 * @returns Type-safe verification result
 */
export function verifyRefreshToken(token: string): JwtVerifyResult<RefreshTokenPayload> {
  const result = verifyToken<RefreshTokenPayload>(token, jwtConfig.refresh.secret, {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithms: [jwtConfig.algorithm],
  });

  if (result.success && result.payload.type !== JWT_CONSTANTS.TOKEN_TYPES.REFRESH) {
    return {
      success: false,
      error: 'INVALID',
    };
  }

  return result;
}

/**
 * Decodes a token payload without verifying its signature.
 *
 * @param token JWT token string
 * @returns Decoded payload claims structure or null
 */
export function decodeToken(token: string): BaseJwtPayload | null {
  return decodeTokenHelper<BaseJwtPayload>(token);
}
