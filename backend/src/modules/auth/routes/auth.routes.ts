import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { validate } from '../../../middleware';
import { LoginSchema } from '../dto/login.dto';
import { RefreshTokenSchema } from '../dto/refresh-token.dto';

/**
 * Authentication Controller Contract for Router Injection.
 */
export interface IAuthController {
  login(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  refreshToken(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

/**
 * Configures and returns the Authentication Router.
 * Protects logout using the injected authMiddleware handler.
 *
 * @param authController The controller delegate
 * @param authMiddleware RequestHandler enforcing JWT Access Token validation
 * @returns Express Router instance
 */
export function createAuthRouter(
  authController: IAuthController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  // POST /login - Credentials verification and session creation
  router.post('/login', validate(LoginSchema), authController.login);

  // POST /refresh-token - Session refresh and token rotation
  router.post('/refresh-token', validate(RefreshTokenSchema), authController.refreshToken);

  // POST /logout - Session termination (requires token authentication)
  router.post('/logout', authMiddleware, authController.logout);

  // Future Authentication Placeholders (Not Implemented)
  // router.post('/forgot-password', authController.forgotPassword);
  // router.post('/reset-password', authController.resetPassword);
  // router.post('/change-password', authController.changePassword);

  return router;
}
