/**
 * Shared base operational exception class for all domain and service layers.
 */
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
    Error.captureStackTrace(this, this.constructor);
  }
}
