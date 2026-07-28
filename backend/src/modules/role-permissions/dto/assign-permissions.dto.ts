import { z } from 'zod';
import { PermissionIdsSchema, IsGrantedSchema } from './shared.schema';

/**
 * Zod validation schema for assigning permissions to a role.
 * Enforces list requirements, unique UUIDs, and strict body evaluations.
 */
export const AssignPermissionsSchema = z
  .object({
    permissionIds: PermissionIdsSchema,
    isGranted: IsGrantedSchema,
  })
  .strict();

export type AssignPermissionsDto = z.infer<typeof AssignPermissionsSchema>;
