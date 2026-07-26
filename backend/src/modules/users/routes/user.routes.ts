import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { validate } from '../../../middleware';
import { FindUsersSchema } from '../dto/find-users.dto';
import { UpdateProfileSchema } from '../dto/update-profile.dto';
import { UpdateStatusSchema } from '../dto/update-status.dto';

export interface IUserController {
  getMyProfile(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  updateMyProfile(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  getUsers(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  getUserById(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  updateUserStatus(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  softDeleteUser(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

/**
 * Configures and returns the Users Router.
 * Registers query/body schemas and mounts authentication & authorization middleware filters.
 *
 * @param userController Controller delegate handling endpoints
 * @param authMiddleware RequestHandler enforcing JWT Access Token validation
 * @param authorizeAdminMiddleware RequestHandler enforcing Administrative role access
 * @returns Express Router instance
 */
export function createUsersRouter(
  userController: IUserController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // All endpoints require user authentication
  router.use(authMiddleware);

  // Self endpoints
  router.get('/me', userController.getMyProfile);
  router.patch('/me', validate(UpdateProfileSchema), userController.updateMyProfile);

  // Administrative endpoints
  router.get(
    '/',
    authorizeAdminMiddleware,
    validate({ query: FindUsersSchema }),
    userController.getUsers
  );
  router.get('/:id', authorizeAdminMiddleware, userController.getUserById);
  router.patch(
    '/:id/status',
    authorizeAdminMiddleware,
    validate(UpdateStatusSchema),
    userController.updateUserStatus
  );
  router.delete('/:id', authorizeAdminMiddleware, userController.softDeleteUser);

  return router;
}
