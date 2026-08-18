import type { UserStatus } from './user';

/**
 * Public User profile nested within authentication responses.
 */
export interface AuthUser {
  id: string;
  email: string;
  status: UserStatus;
  roles: string[];
}

/**
 * Payload returned upon successful authentication or token refresh.
 */
export interface AuthTokensResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/**
 * Login Request DTO.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Refresh Token Request DTO.
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Forgot Password Request DTO.
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request DTO.
 */
export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

/**
 * Change Password Request DTO.
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
