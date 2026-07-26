import { z } from 'zod';
import { RoleNameSchema, DescriptionSchema, PrioritySchema } from './shared.schema';

/**
 * Zod validation schema for updating role records.
 * Uses strict mode and requires at least one field to be present.
 */
export const UpdateRoleSchema = z
  .object({
    name: RoleNameSchema.optional(),
    description: DescriptionSchema.optional(),
    priority: PrioritySchema.optional(),
    isDefault: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
