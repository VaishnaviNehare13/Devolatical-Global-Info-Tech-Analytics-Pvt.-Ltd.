import { Router, Request, Response, NextFunction } from 'express';

/**
 * Authentication Controller Contract for Router Injection.
 * Decouples routing registration from controller implementation details.
 */
export interface IAuthController {
  login(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

/**
 * Configures and returns the Authentication Router.
 * Registers login endpoints and future placeholders.
 *
 * @param authController Concrete controller implementation satisfying IAuthController
 * @returns Configured Express Router
 */
export function createAuthRouter(authController: IAuthController): Router {
  const router = Router();

  // POST /login - Delegate credentials verification and session creation
  router.post('/login', authController.login);

  // Future Authentication Placeholders (Not Implemented)
  // router.post('/refresh-token', authController.refreshToken);
  // router.post('/logout', authController.logout);
  // router.post('/forgot-password', authController.forgotPassword);
  // router.post('/reset-password', authController.resetPassword);
  // router.post('/change-password', authController.changePassword);

  return router;
}
