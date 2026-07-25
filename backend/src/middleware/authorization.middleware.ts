import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * Extensible configuration options for Authorization Middleware.
 */
export interface AuthorizationOptions {
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

/**
 * Custom Authorization Error thrown on permission or role check failures.
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden: Insufficient role or privileges') {
    super(message, HttpStatus.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

/**
 * Generic authorization middleware checking user roles and/or permissions.
 * Relies on Request.user attached by Authentication middleware.
 *
 * @param options Required roles and/or permissions to access the resource
 */
export function authorize(options: AuthorizationOptions): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Unauthorized: Authentication required', HttpStatus.UNAUTHORIZED);
      }

      // Validate required roles if configured
      if (options.roles && options.roles.length > 0) {
        const hasRequiredRole = user.roles.some((role) => options.roles!.includes(role));
        if (!hasRequiredRole) {
          throw new AuthorizationError('Forbidden: Insufficient role');
        }
      }

      // Validate required permissions if configured (Reserved for future implementation)
      if (options.permissions && options.permissions.length > 0) {
        throw new AuthorizationError('Forbidden: Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
