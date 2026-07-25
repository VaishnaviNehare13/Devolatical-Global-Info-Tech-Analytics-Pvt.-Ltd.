import { z } from 'zod';

/**
 * Zod validation schema for refresh token request payloads.
 * Rejects unknown properties using strict validation.
 */
export const RefreshTokenSchema = z
  .object({
    refreshToken: z
      .string({
        required_error: 'Refresh token is required',
      })
      .trim()
      .min(1, 'Refresh token is required'),
  })
  .strict();

/**
 * TypeScript contract inferred directly from Zod validation schema
 */
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
