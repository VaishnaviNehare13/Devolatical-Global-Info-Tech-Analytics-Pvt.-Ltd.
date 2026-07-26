import { z } from 'zod';
import { UserStatus } from '../types/user.types';

/**
 * Zod validation schema for updating user activation status.
 * Rejects any values outside the system UserStatus enum.
 */
export const UpdateStatusSchema = z
  .object({
    status: z.nativeEnum(UserStatus, {
      errorMap: () => ({ message: 'Invalid user status value provided.' }),
    }),
  })
  .strict();

export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
