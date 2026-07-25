import { z } from 'zod';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth.validation.constants';

/**
 * Zod validation schema for forgot password request payloads.
 * Rejects unknown properties using strict validation.
 */
export const ForgotPasswordSchema = z
  .object({
    email: z
      .string({
        required_error: AUTH_VALIDATION_MESSAGES.EMAIL.REQUIRED,
      })
      .trim()
      .min(1, AUTH_VALIDATION_MESSAGES.EMAIL.REQUIRED)
      .email(AUTH_VALIDATION_MESSAGES.EMAIL.INVALID),
  })
  .strict();

/**
 * TypeScript contract inferred directly from Zod validation schema
 */
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
