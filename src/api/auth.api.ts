import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  AuthTokensResponseData,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../types/auth';

/**
 * Authentication API Service Module.
 * Strictly communicates with backend /api/v1/auth routes.
 */
export const authApi = {
  /**
   * Authenticate user credentials and retrieve access/refresh token pair.
   * POST /api/v1/auth/login
   */
  login: (data: LoginRequest): Promise<ApiResponse<AuthTokensResponseData>> =>
    apiClient.post<ApiResponse<AuthTokensResponseData>>('/auth/login', data, { skipAuth: true }),

  /**
   * Rotate and renew active session tokens using a valid refresh token.
   * POST /api/v1/auth/refresh-token
   */
  refreshToken: (data: RefreshTokenRequest): Promise<ApiResponse<AuthTokensResponseData>> =>
    apiClient.post<ApiResponse<AuthTokensResponseData>>('/auth/refresh-token', data, {
      skipAuth: true,
    }),

  /**
   * Terminate active user session and revoke server token.
   * POST /api/v1/auth/logout
   */
  logout: (): Promise<ApiResponse<null>> =>
    apiClient.post<ApiResponse<null>>('/auth/logout'),

  /**
   * Request a password reset link to be sent to user email.
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: (data: ForgotPasswordRequest): Promise<ApiResponse<null>> =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', data, { skipAuth: true }),

  /**
   * Reset user password using token received via email.
   * POST /api/v1/auth/reset-password
   */
  resetPassword: (data: ResetPasswordRequest): Promise<ApiResponse<null>> =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', data, { skipAuth: true }),

  /**
   * Update password during an active authenticated session.
   * POST /api/v1/auth/change-password
   */
  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<null>> =>
    apiClient.post<ApiResponse<null>>('/auth/change-password', data),
};
