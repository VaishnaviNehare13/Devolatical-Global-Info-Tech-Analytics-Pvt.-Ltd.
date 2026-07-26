/**
 * Base User Service Exception.
 */
export class UserServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'UserServiceError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Exception thrown when a user record does not exist.
 */
export class UserNotFoundError extends UserServiceError {
  constructor(message: string, cause?: unknown) {
    super('USER_NOT_FOUND', message, cause);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Exception thrown when a status change violates business workflows.
 */
export class InvalidUserStatusError extends UserServiceError {
  constructor(message: string, cause?: unknown) {
    super('INVALID_STATUS_TRANSITION', message, cause);
    this.name = 'InvalidUserStatusError';
  }
}

/**
 * Exception thrown when trying to perform updates/deletes on protected admin accounts.
 */
export class ProtectedUserError extends UserServiceError {
  constructor(message: string, cause?: unknown) {
    super('PROTECTED_USER', message, cause);
    this.name = 'ProtectedUserError';
  }
}
