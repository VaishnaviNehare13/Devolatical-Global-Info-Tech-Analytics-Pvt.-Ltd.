/**
 * Reusable Password Utility Type Definitions
 *
 * Centralizes types, enums, and error definitions for password cryptography.
 */

/**
 * Type-safe branded string or alias representing a hashed password.
 */
export type PasswordHash = string;

/**
 * Type representing the outcome of a password comparison.
 */
export type PasswordComparisonResult = boolean;

/**
 * Strongly typed error codes for password operations.
 */
export type PasswordErrorCode = 'PASSWORD_HASH_FAILED' | 'PASSWORD_COMPARE_FAILED';

/**
 * Custom Error class for isolating password utility errors.
 * Ensures the application is decoupled from bcrypt-specific error classes.
 */
export class PasswordError extends Error {
  public readonly code: PasswordErrorCode;

  constructor(code: PasswordErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'PasswordError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
    // Capture the stack trace, keeping the constructor call out of it
    Error.captureStackTrace(this, this.constructor);
  }
}
