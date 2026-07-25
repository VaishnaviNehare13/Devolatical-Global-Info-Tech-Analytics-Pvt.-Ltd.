import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../shared/utils/jwt';
import { IAuthRepository } from '../modules/auth/repositories/auth.repository.interface';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * Express middleware class for authenticating requests via JWT Access Tokens.
 * Utilizes constructor dependency injection to remain decoupled from concrete repositories.
 */
export class AuthMiddleware {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Middleware handler function to be registered in Express route chains.
   */
  public handle = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new AppError('Unauthorized: Missing Authorization header', HttpStatus.UNAUTHORIZED);
      }

      if (!authHeader.startsWith('Bearer ')) {
        throw new AppError('Unauthorized: Invalid token format', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);
      const result = verifyAccessToken(token);

      if (!result.success) {
        let message = 'Unauthorized: Invalid token';
        if (result.error === 'EXPIRED') {
          message = 'Unauthorized: Token has expired';
        } else if (result.error === 'MALFORMED') {
          message = 'Unauthorized: Token is malformed';
        }
        throw new AppError(message, HttpStatus.UNAUTHORIZED);
      }

      const payload = result.payload;
      const user = await this.authRepository.findUserById(payload.sub);

      if (!user) {
        throw new AppError('Unauthorized: User not found', HttpStatus.UNAUTHORIZED);
      }

      if (user.status !== 'ACTIVE') {
        throw new AppError('Unauthorized: User account is inactive', HttpStatus.UNAUTHORIZED);
      }

      // Populate Request.user using augmented express types
      req.user = {
        id: user.id,
        email: user.email,
        status: user.status,
        roles: user.roles.map((r) => r.name),
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
