import { Router, RequestHandler } from 'express';
import { RolePermissionController } from '../controllers/role-permission.controller';
import { validate } from '../../../middleware';
import {
  RoleParamSchema,
  RolePermissionParamSchema,
  AssignPermissionsSchema,
  ReplacePermissionsSchema,
  FindRolePermissionsSchema,
} from '../dto';

/**
 * Factory function to instantiate and configure Role-Permission Mapping routing endpoints.
 * Applies authentication, authorization, and Zod input validations.
 *
 * @param controller Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative privileges
 */
export function createRolePermissionsRouter(
  controller: RolePermissionController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Protect all endpoints with authentication and authorization
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // GET /roles/:roleId/permissions
  router.get(
    '/:roleId/permissions',
    validate({
      params: RoleParamSchema,
      query: FindRolePermissionsSchema,
    }),
    controller.getRolePermissions
  );

  // POST /roles/:roleId/permissions
  router.post(
    '/:roleId/permissions',
    validate({
      params: RoleParamSchema,
      body: AssignPermissionsSchema,
    }),
    controller.assignPermissions
  );

  // PUT /roles/:roleId/permissions
  router.put(
    '/:roleId/permissions',
    validate({
      params: RoleParamSchema,
      body: ReplacePermissionsSchema,
    }),
    controller.replacePermissions
  );

  // DELETE /roles/:roleId/permissions/:permissionId
  router.delete(
    '/:roleId/permissions/:permissionId',
    validate({
      params: RolePermissionParamSchema,
    }),
    controller.removePermission
  );

  return router;
}
