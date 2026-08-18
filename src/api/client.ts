import { ApiError } from '../types/api';
import type { ApiErrorPayload } from '../types/api';

/**
 * Type definition for dynamic token resolution callback.
 */
export type TokenGetter = () => string | null | Promise<string | null>;

/**
 * Extended request options for the centralized API client.
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, unknown>;
  body?: unknown;
  skipAuth?: boolean;
}

// Global API configuration
const DEFAULT_BASE_URL = 'http://localhost:5000/api/v1';

let apiBaseUrl: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || DEFAULT_BASE_URL;

let currentAccessToken: string | null = null;
let customTokenGetter: TokenGetter | null = null;

/**
 * Configures the base URL for API requests.
 */
export function setApiBaseUrl(url: string): void {
  apiBaseUrl = url.replace(/\/+$/, '');
}

/**
 * Retrieves the current configured API base URL.
 */
export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

/**
 * Sets a static access token to attach to authenticated requests.
 */
export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

/**
 * Retrieves the currently assigned static access token.
 */
export function getAccessToken(): string | null {
  return currentAccessToken;
}

/**
 * Registers a dynamic token getter callback (e.g. from an AuthContext).
 */
export function setTokenGetter(getter: TokenGetter | null): void {
  customTokenGetter = getter;
}

/**
 * Resolves the active access token using the registered getter or static token.
 */
async function resolveToken(): Promise<string | null> {
  if (customTokenGetter) {
    try {
      const token = await customTokenGetter();
      if (token) return token;
    } catch {
      // Fall back to static token if getter throws
    }
  }
  return currentAccessToken;
}

/**
 * Serializes query parameters into a URL search string, omitting undefined and null values.
 */
export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (value instanceof Date) {
      searchParams.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      }
    } else {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Core HTTP Request Execution.
 */
export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, skipAuth = false, headers = {}, ...restOptions } = options;

  // Build clean URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const queryString = buildQueryString(params);
  const fullUrl = `${apiBaseUrl.replace(/\/+$/, '')}${normalizedEndpoint}${queryString}`;

  const requestHeaders = new Headers(headers);

  // Attach authorization header if available and not skipped
  if (!skipAuth && !requestHeaders.has('Authorization')) {
    const token = await resolveToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  // Handle request body and Content-Type
  let requestBody: BodyInit | undefined = undefined;

  if (body instanceof FormData) {
    // Let browser generate multipart/form-data boundary automatically
    requestBody = body;
  } else if (body !== undefined && body !== null) {
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, {
      ...restOptions,
      headers: requestHeaders,
      body: requestBody,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let responseData: any = null;
    if (isJson) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else {
      try {
        responseData = await response.text();
      } catch {
        responseData = null;
      }
    }

    // Handle HTTP Error responses
    if (!response.ok) {
      const errorPayload = isJson && responseData ? (responseData as ApiErrorPayload) : undefined;
      const errorMessage =
        errorPayload?.message ||
        (typeof responseData === 'string' && responseData) ||
        `HTTP Request failed with status ${response.status} (${response.statusText})`;

      throw new ApiError(errorMessage, response.status, errorPayload?.errors, errorPayload);
    }

    return responseData as T;
  } catch (error: unknown) {
    if (ApiError.isApiError(error)) {
      throw error;
    }

    const networkMessage =
      error instanceof Error ? error.message : 'Network request failed or server is unreachable.';
    throw new ApiError(networkMessage, 0);
  }
}

/**
 * Convenient API Client Wrapper Object.
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'POST', body: formData }),
};
