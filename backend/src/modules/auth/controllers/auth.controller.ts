import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../services/auth.service.interface';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
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
}
