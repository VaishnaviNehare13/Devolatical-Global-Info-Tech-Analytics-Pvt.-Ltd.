import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../../middleware';
import { LoginSchema } from '../dto/login.dto';
import { RefreshTokenSchema } from '../dto/refresh-token.dto';

/**
 * Authentication Controller Contract for Router Injection.
 */
export interface IAuthController {
  login(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  refreshToken(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

/**
 * Configures and returns the Authentication Router.
 *
 * @param authController The controller delegate
 * @returns Express Router instance
 */
export function createAuthRouter(authController: IAuthController): Router {
  const router = Router();

  // POST /login - Credentials verification and session creation
  router.post('/login', validate(LoginSchema), authController.login);

  // POST /refresh-token - Session refresh and token rotation
  router.post('/refresh-token', validate(RefreshTokenSchema), authController.refreshToken);

  // Future Authentication Placeholders (Not Implemented)
  // router.post('/logout', authController.logout);
  // router.post('/forgot-password', authController.forgotPassword);
  // router.post('/reset-password', authController.resetPassword);
  // router.post('/change-password', authController.changePassword);

  return router;
}
