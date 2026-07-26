/**
 * Shared base operational exception class for all database and repository layers.
 */
export class RepositoryError extends Error {
  public readonly code: string;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
