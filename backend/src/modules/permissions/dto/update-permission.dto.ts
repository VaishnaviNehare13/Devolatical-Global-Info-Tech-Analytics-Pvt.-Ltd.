import { z } from 'zod';
import { PermissionNameSchema, PermissionDescriptionSchema } from './shared.schema';

/**
 * Zod validation schema for updating permission records.
 * Uses strict mode to explicitly reject updates to immutable fields like code or isSystem.
 * Requires at least one mutable field to be present.
 */
export const UpdatePermissionSchema = z
  .object({
    name: PermissionNameSchema.optional(),
    description: PermissionDescriptionSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdatePermissionDto = z.infer<typeof UpdatePermissionSchema>;
