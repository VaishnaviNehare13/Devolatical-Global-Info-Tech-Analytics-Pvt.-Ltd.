import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../../../shared/constants/password.constants';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth.validation.constants';

/**
 * Zod validation schema for change password request payloads.
 * Rejects unknown properties using strict validation.
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: 'Current password is required',
      })
      .trim()
      .min(1, 'Current password is required'),
    newPassword: z
      .string({
        required_error: AUTH_VALIDATION_MESSAGES.PASSWORD.REQUIRED,
      })
      .trim()
      .min(PASSWORD_MIN_LENGTH, AUTH_VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH)
      .max(PASSWORD_MAX_LENGTH, AUTH_VALIDATION_MESSAGES.PASSWORD.MAX_LENGTH),
  })
  .strict();

/**
 * TypeScript contract inferred directly from Zod validation schema
 */
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
