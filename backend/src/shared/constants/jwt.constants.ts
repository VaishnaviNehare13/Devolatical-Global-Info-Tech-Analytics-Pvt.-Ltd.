/**
 * Reusable JWT System Constants
 *
 * Centralizes all magic strings associated with JWT tokens, HTTP cookies,
 * and authorization headers to avoid duplication.
 */
export const JWT_CONSTANTS = Object.freeze({
  TOKEN_TYPES: {
    ACCESS: 'ACCESS',
    REFRESH: 'REFRESH',
    RESET: 'RESET',
  } as const,
  HEADER: {
    PREFIX: 'Bearer ' as const,
  },
  COOKIES: {
    ACCESS_TOKEN_COOKIE: 'accessToken' as const,
    REFRESH_TOKEN_COOKIE: 'refreshToken' as const,
  },
});
