import { z } from 'zod';
import { ROLE_PERMISSION_VALIDATION } from '../constants/role-permission.constants';

export const RoleIdSchema = z
  .string({ required_error: 'Role ID is required.' })
  .uuid('Invalid Role ID format. Must be a valid UUID.');

export const PermissionIdsSchema = z
  .array(
    z
      .string({ required_error: 'Permission ID is required.' })
      .uuid('Invalid Permission ID format. Must be a valid UUID.')
  )
  .min(
    ROLE_PERMISSION_VALIDATION.MIN_ASSIGNED_PERMISSIONS,
    `At least ${ROLE_PERMISSION_VALIDATION.MIN_ASSIGNED_PERMISSIONS} permission ID must be provided.`
  )
  .max(
    ROLE_PERMISSION_VALIDATION.MAX_ASSIGNED_PERMISSIONS,
    `No more than ${ROLE_PERMISSION_VALIDATION.MAX_ASSIGNED_PERMISSIONS} permission IDs can be assigned at once.`
  )
  .refine((items) => new Set(items).size === items.length, {
    message: 'Duplicate permission IDs are not allowed.',
  });

export const IsGrantedSchema = z.boolean().optional().default(true);

export const RoleParamSchema = z
  .object({
    roleId: RoleIdSchema,
  })
  .strict();

export const RolePermissionParamSchema = z
  .object({
    roleId: RoleIdSchema,
    permissionId: z
      .string({ required_error: 'Permission ID is required.' })
      .uuid('Invalid Permission ID format. Must be a valid UUID.'),
  })
  .strict();
