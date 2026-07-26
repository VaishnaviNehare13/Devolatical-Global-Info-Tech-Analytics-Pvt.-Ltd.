import { z } from 'zod';

/**
 * Zod validation schema for updating role activation status flag.
 */
export const UpdateRoleStatusSchema = z
  .object({
    isActive: z.boolean({ required_error: 'isActive status flag is required.' }),
  })
  .strict();

export type UpdateRoleStatusDto = z.infer<typeof UpdateRoleStatusSchema>;
