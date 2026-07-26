import { Router, RequestHandler } from 'express';
import { RoleController } from '../controllers/role.controller';
import { validate } from '../../../middleware';
import { IdParamSchema } from '../../../shared/dto/id-param.dto';
import {
  CreateRoleSchema,
  UpdateRoleSchema,
  UpdateRoleStatusSchema,
  FindRolesSchema,
} from '../dto';

/**
 * Factory function to instantiate and configure Roles routing endpoints.
 * Applies authentication, authorization, and Zod input validations.
 *
 * @param roleController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createRolesRouter(
  roleController: RoleController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Protect all endpoints with authentication and authorization
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // Administrative Role Management Endpoints
  router.get('/', validate({ query: FindRolesSchema }), roleController.getRoles);

  router.get('/:id', validate({ params: IdParamSchema }), roleController.getRoleById);

  router.post('/', validate({ body: CreateRoleSchema }), roleController.createRole);

  router.patch(
    '/:id',
    validate({
      params: IdParamSchema,
      body: UpdateRoleSchema,
    }),
    roleController.updateRole
  );

  router.patch(
    '/:id/status',
    validate({
      params: IdParamSchema,
      body: UpdateRoleStatusSchema,
    }),
    roleController.updateRoleStatus
  );

  router.delete('/:id', validate({ params: IdParamSchema }), roleController.deleteRole);

  return router;
}
