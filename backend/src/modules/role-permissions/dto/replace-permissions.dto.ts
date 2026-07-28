import { z } from 'zod';
import { IsGrantedSchema } from './shared.schema';
import { ROLE_PERMISSION_VALIDATION } from '../constants/role-permission.constants';

/**
 * Reusable schema for replace permission IDs.
 * Allows empty arrays specifically to enable 'remove all permissions' sync state.
 */
export const ReplacePermissionIdsSchema = z
  .array(
    z
      .string({ required_error: 'Permission ID is required.' })
      .uuid('Invalid Permission ID format. Must be a valid UUID.')
  )
  .max(
    ROLE_PERMISSION_VALIDATION.MAX_ASSIGNED_PERMISSIONS,
    `No more than ${ROLE_PERMISSION_VALIDATION.MAX_ASSIGNED_PERMISSIONS} permission IDs can be assigned at once.`
  )
  .refine((items) => new Set(items).size === items.length, {
    message: 'Duplicate permission IDs are not allowed.',
  });

/**
 * Zod validation schema for replacing/synchronizing permissions for a role.
 * Allows empty arrays for permissionIds to support full permission revocation.
 */
export const ReplacePermissionsSchema = z
  .object({
    permissionIds: ReplacePermissionIdsSchema,
    isGranted: IsGrantedSchema,
  })
  .strict();

export type ReplacePermissionsDto = z.infer<typeof ReplacePermissionsSchema>;
