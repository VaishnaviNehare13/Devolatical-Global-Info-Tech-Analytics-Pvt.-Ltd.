/**
 * Shared generic interface for paginated results across service layers.
 */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/**
 * Shared generic type for standard paginated HTTP response data bodies.
 */
export interface PaginatedResponse<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: PaginatedResult<T>;
}
