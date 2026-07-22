/**
 * Standardized API Response structure for consistent JSON payloads.
 */
export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data?: T;
  public errors?: unknown;
  public timestamp: string;

  constructor(success: boolean, message: string, data?: T, errors?: unknown) {
    this.success = success;
    this.message = message;
    this.timestamp = new Date().toISOString();
    if (data !== undefined) {
      this.data = data;
    }
    if (errors !== undefined) {
      this.errors = errors;
    }
  }

  /**
   * Helper to return a successful API response.
   */
  static success<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  /**
   * Helper to return an error API response.
   */
  static error(message: string, errors?: unknown): ApiResponse {
    return new ApiResponse(false, message, undefined, errors);
  }
}
