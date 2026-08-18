/**
 * Generic API success response envelope matching backend JSON structure.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Generic API error response envelope matching backend error handler.
 */
export interface ApiErrorPayload {
  success: false;
  message: string;
  timestamp: string;
  errors?: unknown;
  stack?: string;
}

/**
 * Reusable pagination metadata contract.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  pages?: number;
  totalCount?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

/**
 * Generic paginated response body wrapping items and pagination metrics.
 */
export interface PaginatedData<T> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pages?: number;
  totalCount?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  pagination?: PaginationMeta;
}

/**
 * Paginated API response structure.
 */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

/**
 * Common query parameters supported across backend paginated endpoints.
 */
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/**
 * Custom operational API Error class with strongly typed backend payload context.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly timestamp: string;
  public readonly errors?: unknown;
  public readonly rawPayload?: ApiErrorPayload;

  constructor(
    message: string,
    status: number,
    errors?: unknown,
    rawPayload?: ApiErrorPayload
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.timestamp = rawPayload?.timestamp || new Date().toISOString();
    this.errors = errors;
    this.rawPayload = rawPayload;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}
