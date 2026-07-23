import jwt, { SignOptions, VerifyOptions, TokenExpiredError, JsonWebTokenError, NotBeforeError } from 'jsonwebtoken';
import { JwtVerifyResult, JwtErrorCode } from '../types/jwt.types';

/**
 * Generically signs a payload to generate a JWT.
 * 
 * @param payload Immutable data structure containing claims
 * @param secret Secret key for signing
 * @param options Expiration, issuer, audience, and algorithm options
 * @returns Signed JWT string
 */
export function signToken<T extends object>(
  payload: T,
  secret: string,
  options: SignOptions
): string {
  return jwt.sign(payload, secret, options);
}

/**
 * Validates a JWT and extracts its payload.
 * Maps library-specific errors to strongly-typed system error codes.
 * 
 * @param token JWT string to verify
 * @param secret Secret key used during signing
 * @param options Issuer, audience, and algorithm options
 * @returns Result object containing the parsed payload or a typed error code
 */
export function verifyToken<T extends object>(
  token: string,
  secret: string,
  options: VerifyOptions
): JwtVerifyResult<T> {
  try {
    const decoded = jwt.verify(token, secret, options);
    
    if (!decoded || typeof decoded !== 'object') {
      return {
        success: false,
        error: 'INVALID',
      };
    }

    return {
      success: true,
      payload: decoded as T,
    };
  } catch (error) {
    let errorCode: JwtErrorCode = 'INVALID';

    if (error instanceof TokenExpiredError) {
      errorCode = 'EXPIRED';
    } else if (error instanceof NotBeforeError) {
      errorCode = 'UNSUPPORTED';
    } else if (error instanceof JsonWebTokenError) {
      if (error.message.includes('jwt malformed')) {
        errorCode = 'MALFORMED';
      } else if (error.message.includes('unsupported')) {
        errorCode = 'UNSUPPORTED';
      } else {
        errorCode = 'INVALID';
      }
    }

    return {
      success: false,
      error: errorCode,
    };
  }
}

/**
 * Decodes a token's payload without verifying its signature.
 * 
 * @param token JWT string to decode
 * @returns Decoded payload claims structure or null
 */
export function decodeToken<T extends object>(token: string): T | null {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') {
      return null;
    }
    return decoded as T;
  } catch {
    return null;
  }
}
