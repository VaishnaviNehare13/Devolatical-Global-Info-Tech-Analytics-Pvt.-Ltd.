import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../../../shared/constants/password.constants';

/**
 * Centralized Validation Message Constants for Authentication DTOs.
 */
export const AUTH_VALIDATION_MESSAGES = Object.freeze({
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Invalid email address',
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: `Password must contain at least ${PASSWORD_MIN_LENGTH} characters`,
    MAX_LENGTH: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`,
  },
});
