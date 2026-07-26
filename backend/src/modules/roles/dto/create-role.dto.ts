import { z } from 'zod';
import { RoleNameSchema, RoleCodeSchema, DescriptionSchema, PrioritySchema } from './shared.schema';

/**
 * Zod validation schema for creating a new custom role.
 * Automatically normalizes alphanumeric codes to uppercase before validating.
 */
export const CreateRoleSchema = z
  .object({
    name: RoleNameSchema,
    code: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      RoleCodeSchema
    ),
    description: DescriptionSchema.optional(),
    priority: PrioritySchema.optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
