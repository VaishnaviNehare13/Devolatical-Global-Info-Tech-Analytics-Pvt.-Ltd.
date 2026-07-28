import { Router, RequestHandler } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { validate } from '../../../middleware';
import { IdParamSchema } from '../../../shared/dto/id-param.dto';
import { CreatePermissionSchema, UpdatePermissionSchema, FindPermissionsSchema } from '../dto';

/**
 * Factory function to instantiate and configure Permissions routing endpoints.
 * Applies authentication, authorization, and Zod input validations.
 *
 * @param permissionController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createPermissionsRouter(
  permissionController: PermissionController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Protect all endpoints with authentication and authorization
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // Administrative Permission Management Endpoints
  router.get('/', validate({ query: FindPermissionsSchema }), permissionController.getPermissions);

  router.get('/:id', validate({ params: IdParamSchema }), permissionController.getPermissionById);

  router.post(
    '/',
    validate({ body: CreatePermissionSchema }),
    permissionController.createPermission
  );

  router.patch(
    '/:id',
    validate({
      params: IdParamSchema,
      body: UpdatePermissionSchema,
    }),
    permissionController.updatePermission
  );

  router.delete('/:id', validate({ params: IdParamSchema }), permissionController.deletePermission);

  return router;
}
