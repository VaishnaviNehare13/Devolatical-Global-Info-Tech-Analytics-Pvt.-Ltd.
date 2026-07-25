import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../services/auth.service.interface';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { HttpStatus } from '../../../constants/httpStatus';

/**
 * Express Controller responsible for delegating authentication endpoints to business service layers.
 * Utilizes constructor dependency injection to keep presentation interfaces decoupled.
 */
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  /**
   * Controller handler for validating user credentials and establishing token sessions.
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LoginDto = req.body;
      const result = await this.authService.login(dto.email, dto.password);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller handler for executing token rotation flows using active refresh tokens.
   */
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: RefreshTokenDto = req.body;
      const result = await this.authService.refreshToken(dto.refreshToken);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Token refresh successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller handler for terminating user sessions and clearing session contexts.
   */
  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is guaranteed to be populated by the upstream authMiddleware
      const userId = req.user!.id;
      await this.authService.logout(userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logout successful.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller handler for initiating user password recovery procedures.
   */
  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ForgotPasswordDto = req.body;
      await this.authService.forgotPassword(dto.email);

      // Generic response to prevent user enumeration security flaws
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller handler for executing password resets via validation tokens.
   */
  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: ResetPasswordDto = req.body;
      await this.authService.resetPassword(dto.resetToken, dto.newPassword);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Password has been reset successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
