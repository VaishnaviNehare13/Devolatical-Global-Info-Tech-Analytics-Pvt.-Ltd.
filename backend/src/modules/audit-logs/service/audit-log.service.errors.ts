/**
 * Base Audit Log Service Exception.
 */
export class AuditLogServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'AuditLogServiceError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Exception thrown when a requested audit log record does not exist.
 */
export class AuditLogNotFoundError extends AuditLogServiceError {
  constructor(message: string, cause?: unknown) {
    super('AUDIT_LOG_NOT_FOUND', message, cause);
    this.name = 'AuditLogNotFoundError';
  }
}

/**
 * Exception thrown when audit log queries contain invalid pagination, sorting, or filtering parameters.
 */
export class AuditLogValidationError extends AuditLogServiceError {
  constructor(message: string, cause?: unknown) {
    super('AUDIT_LOG_VALIDATION_FAILED', message, cause);
    this.name = 'AuditLogValidationError';
  }
}
