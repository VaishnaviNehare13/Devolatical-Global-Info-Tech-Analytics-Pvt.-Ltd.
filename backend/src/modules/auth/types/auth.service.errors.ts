/**
 * Strongly typed service layer authentication error codes
 */
export type AuthenticationErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_DISABLED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_NOT_FOUND'
  | 'INVALID_PASSWORD';

/**
 * Custom operational Authentication Error to isolate business workflows
 * from implementation-specific errors (like Prisma, JWT, or bcrypt).
 */
export class AuthenticationError extends Error {
  public readonly code: AuthenticationErrorCode;

  constructor(code: AuthenticationErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
    // Capture the stack trace, keeping the constructor call out of it
    Error.captureStackTrace(this, this.constructor);
  }
}
