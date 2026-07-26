import { z } from 'zod';

/**
 * Zod validation schema for updating user profile fields.
 * Validates shapes, formats (like URLs), and trims strings.
 */
export const UpdateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name cannot be empty').optional(),
    middleName: z.string().trim().nullable().optional(),
    lastName: z.string().trim().min(1, 'Last name cannot be empty').optional(),
    displayName: z.string().trim().min(1, 'Display name cannot be empty').optional(),
    phone: z.string().trim().nullable().optional(),
    avatarUrl: z.string().trim().url('Invalid avatar URL format').nullable().optional(),
  })
  .strict();

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
