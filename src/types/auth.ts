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
 * Response payload for primary login (may require MFA step).
 */
export interface LoginResponseData {
  mfaRequired?: boolean;
  mfaToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
}

/**
 * Response payload for MFA status query.
 */
export interface MfaStatusResponseData {
  enabled: boolean;
  enabledAt: string | null;
}

/**
 * Response payload for MFA setup initiation.
 */
export interface MfaSetupResponseData {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
}

/**
 * Request payload for verifying 6-digit TOTP code during MFA setup.
 */
export interface VerifyMfaRequest {
  code: string;
}

/**
 * Request payload for disabling MFA.
 */
export interface DisableMfaRequest {
  password?: string;
  code?: string;
}

/**
 * Request payload for completing MFA login verification challenge.
 */
export interface VerifyMfaLoginRequest {
  mfaToken: string;
  code: string;
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
