/**
 * Strongly typed database repository error codes
 */
export type RepositoryErrorCode = 'DATABASE_READ_FAILED' | 'DATABASE_UPDATE_FAILED';

/**
 * Custom operational Repository Error to prevent ORM/Prisma exception details
 * from leaking to higher business and API layers.
 */
export class RepositoryError extends Error {
  public readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
    // Capture the stack trace, keeping the constructor call out of it
    Error.captureStackTrace(this, this.constructor);
  }
}
