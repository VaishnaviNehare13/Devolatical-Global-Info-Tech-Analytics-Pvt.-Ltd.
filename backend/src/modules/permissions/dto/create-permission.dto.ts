import { z } from 'zod';
import {
  PermissionNameSchema,
  PermissionCodeSchema,
  PermissionDescriptionSchema,
  PermissionModuleSchema,
  PermissionResourceSchema,
  PermissionActionSchema,
  PermissionDisplayOrderSchema,
} from './shared.schema';

/**
 * Zod validation schema for creating a new permission.
 * Automatically normalizes alphanumeric codes to uppercase before validating.
 */
export const CreatePermissionSchema = z
  .object({
    name: PermissionNameSchema,
    code: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      PermissionCodeSchema
    ),
    description: PermissionDescriptionSchema.optional(),
    module: PermissionModuleSchema,
    resource: PermissionResourceSchema,
    action: PermissionActionSchema,
    displayOrder: PermissionDisplayOrderSchema.optional(),
  })
  .strict();

export type CreatePermissionDto = z.infer<typeof CreatePermissionSchema>;
