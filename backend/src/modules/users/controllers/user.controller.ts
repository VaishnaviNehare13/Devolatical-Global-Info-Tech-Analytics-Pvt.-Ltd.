import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../services/user.service.interface';
import { FindUsersDto } from '../dto/find-users.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { FindUsersOptions } from '../types/user.types';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  UserNotFoundError,
  InvalidUserStatusError,
  ProtectedUserError,
} from '../types/user.service.errors';

/**
 * Express Controller responsible for delegating HTTP endpoints to the UserService layers.
 * Decoupled from service details via constructor dependency injection.
 */
export class UserController {
  constructor(private readonly userService: IUserService) {}

  /**
   * Retrieves profile details of the current authenticated user.
   */
  public getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.userService.getMyProfile(userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Profile retrieved successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates profile fields of the current user.
   */
  public updateMyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dto: UpdateProfileDto = req.body;
      const result = await this.userService.updateMyProfile(userId, dto);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Profile updated successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Searches, filters, and paginates users list.
   * Access restricted to authorized administrative roles.
   */
  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindUsersDto;

      const options: FindUsersOptions = {
        pagination: {
          page: query.page,
          limit: query.limit,
        },
        search: query.search,
        filters: {
          status: query.status,
          roleId: query.roleId,
          includeDeleted: query.includeDeleted,
        },
        sorting: query.sortField
          ? {
              field: query.sortField,
              order: query.sortOrder || 'desc',
            }
          : undefined,
      };

      const result = await this.userService.getUsers(options);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Users list retrieved successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves summary details of any active user by ID.
   * Access restricted to authorized administrative roles.
   */
  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const result = await this.userService.getUserById(userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'User details retrieved successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates status of an active user.
   * Access restricted to authorized administrative roles.
   */
  public updateUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.id;
      const dto: UpdateStatusDto = req.body;
      const result = await this.userService.updateUserStatus(userId, dto.status);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'User status updated successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft-deletes a user.
   * Access restricted to authorized administrative roles.
   */
  public softDeleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.id;
      await this.userService.softDeleteUser(userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'User soft-deleted successfully.',
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain/service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof UserNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (error instanceof InvalidUserStatusError) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else if (error instanceof ProtectedUserError) {
      next(new AppError(error.message, HttpStatus.FORBIDDEN));
    } else {
      next(error);
    }
  }
}
