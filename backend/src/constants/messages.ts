/**
 * Global and reusable response message strings.
 * Helps prevent hardcoded strings in route handlers and middlewares.
 */
export const Messages = {
  HEALTH_SYSTEM_UP: 'System is up and running.',
  DB_CONNECTED: 'Database connection established successfully.',
  DB_UNREACHABLE: 'Database is unreachable.',
  NOT_FOUND: 'Resource not found.',
  INTERNAL_ERROR: 'Internal Server Error',
  VALIDATION_FAILED: 'Validation failed',
  CONFLICT_UNIQUE: 'Conflict: Unique constraint violated.',
  DB_RECORD_NOT_EXIST: 'The requested database record does not exist.',
  DB_SYNTAX_ERROR: 'Invalid database operation syntax.',
  DB_OFFLINE: 'Database service is currently offline or unreachable.',
  TOO_MANY_REQUESTS: 'Too many requests from this client IP. Please try again after some time.',
  CORS_FAILED: 'CORS Policy: Request origin is not allowed access.',
} as const;
