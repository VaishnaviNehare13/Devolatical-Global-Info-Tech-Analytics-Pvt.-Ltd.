import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  AuthTokensResponseData,
  LoginResponseData,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  MfaStatusResponseData,
  MfaSetupResponseData,
  VerifyMfaRequest,
  DisableMfaRequest,
  VerifyMfaLoginRequest,
} from '../types/auth';

/**
 * Authentication API Service Module.
 * Strictly communicates with backend /api/v1/auth routes.
 */
export const authApi = {
  /**
   * Authenticate user credentials and retrieve access/refresh token pair or MFA challenge.
   * POST /api/v1/auth/login
   */
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponseData>> =>
    apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', data, { skipAuth: true }),

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

  /**
   * Query the current user's MFA activation status.
   * GET /api/v1/auth/mfa/status
   */
  getMfaStatus: (): Promise<ApiResponse<MfaStatusResponseData>> =>
    apiClient.get<ApiResponse<MfaStatusResponseData>>('/auth/mfa/status'),

  /**
   * Initiate TOTP MFA setup, generating secret key and QR code.
   * POST /api/v1/auth/mfa/setup
   */
  setupMfa: (): Promise<ApiResponse<MfaSetupResponseData>> =>
    apiClient.post<ApiResponse<MfaSetupResponseData>>('/auth/mfa/setup'),

  /**
   * Verify initial 6-digit TOTP code to complete MFA activation.
   * POST /api/v1/auth/mfa/verify
   */
  verifyMfa: (data: VerifyMfaRequest): Promise<ApiResponse<{ enabled: boolean }>> =>
    apiClient.post<ApiResponse<{ enabled: boolean }>>('/auth/mfa/verify', data),

  /**
   * Disable active MFA on the current user account.
   * POST /api/v1/auth/mfa/disable
   */
  disableMfa: (data: DisableMfaRequest): Promise<ApiResponse<{ enabled: boolean }>> =>
    apiClient.post<ApiResponse<{ enabled: boolean }>>('/auth/mfa/disable', data),

  /**
   * Complete MFA verification challenge during login flow.
   * POST /api/v1/auth/mfa/login
   */
  verifyMfaLogin: (data: VerifyMfaLoginRequest): Promise<ApiResponse<AuthTokensResponseData>> =>
    apiClient.post<ApiResponse<AuthTokensResponseData>>('/auth/mfa/login', data, { skipAuth: true }),
};
