import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { validate } from '../../../middleware';
import { LoginSchema } from '../dto/login.dto';
import { RefreshTokenSchema } from '../dto/refresh-token.dto';
import { ForgotPasswordSchema } from '../dto/forgot-password.dto';
import { ResetPasswordSchema } from '../dto/reset-password.dto';
import { ChangePasswordSchema } from '../dto/change-password.dto';

/**
 * Authentication Controller Contract for Router Injection.
 */
export interface IAuthController {
  login(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  refreshToken(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  forgotPassword(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  changePassword(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  setupMfa(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  verifyAndEnableMfa(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  disableMfa(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  getMfaStatus(req: Request, res: Response, next: NextFunction): void | Promise<void>;
  verifyMfaLogin(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

import { VerifyMfaSchema, DisableMfaSchema, VerifyMfaLoginSchema } from '../dto/mfa.dto';

/**
 * Configures and returns the Authentication Router.
 * Protects logout and change-password using the injected authMiddleware handler.
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

  // POST /forgot-password - Initiate password recovery procedures
  router.post('/forgot-password', validate(ForgotPasswordSchema), authController.forgotPassword);

  // POST /reset-password - Reset password using recovery token
  router.post('/reset-password', validate(ResetPasswordSchema), authController.resetPassword);

  // POST /change-password - Change password during active session (requires token authentication)
  router.post(
    '/change-password',
    authMiddleware,
    validate(ChangePasswordSchema),
    authController.changePassword
  );

  // MFA / 2FA Endpoints
  router.get('/mfa/status', authMiddleware, authController.getMfaStatus);
  router.post('/mfa/setup', authMiddleware, authController.setupMfa);
  router.post('/mfa/verify', authMiddleware, validate(VerifyMfaSchema), authController.verifyAndEnableMfa);
  router.post('/mfa/disable', authMiddleware, validate(DisableMfaSchema), authController.disableMfa);
  router.post('/mfa/login', validate(VerifyMfaLoginSchema), authController.verifyMfaLogin);

  return router;
}

