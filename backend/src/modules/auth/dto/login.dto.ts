import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../../../shared/constants/password.constants';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth.validation.constants';

/**
 * Zod validation schema for login request payloads.
 * Normalizes input via trimming and rejects unknown properties using strict validation.
 */
export const LoginSchema = z
  .object({
    email: z
      .string({
        required_error: AUTH_VALIDATION_MESSAGES.EMAIL.REQUIRED,
      })
      .trim()
      .min(1, AUTH_VALIDATION_MESSAGES.EMAIL.REQUIRED)
      .email(AUTH_VALIDATION_MESSAGES.EMAIL.INVALID),
    password: z
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
export type LoginDto = z.infer<typeof LoginSchema>;
