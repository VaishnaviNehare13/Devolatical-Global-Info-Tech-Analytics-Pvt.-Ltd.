import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { FindPermissionsQueryDto } from '../dto/find-permissions.dto';
import { FindPermissionsOptions } from '../types/permission.types';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  PermissionNotFoundError,
  DuplicatePermissionNameError,
  DuplicatePermissionCodeError,
  ProtectedPermissionError,
  InvalidPermissionUpdateError,
  InvalidPermissionStateError,
} from '../types/permission.service.errors';

/**
 * Express Controller responsible for delegating HTTP endpoints to the PermissionService layers.
 * Decoupled from service details via constructor dependency injection.
 */
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Retrieves a paginated list of permissions.
   */
  public getPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as unknown as FindPermissionsQueryDto;

      const options: FindPermissionsOptions = {
        pagination: {
          page: query.page,
          limit: query.limit,
        },
        search: query.search,
        filters: {
          module: query.module,
          resource: query.resource,
          action: query.action,
          isActive: query.isActive,
          includeDeleted: query.includeDeleted,
        },
        sorting: query.sortField
          ? {
              field: query.sortField,
              order: query.sortOrder || 'desc',
            }
          : undefined,
      };

      const result = await this.permissionService.getPermissions(options);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Permissions list retrieved successfully.',
        data: result,
      });
    } catch (error) {
      try {
        this.handleServiceError(error);
      } catch (mappedError) {
        next(mappedError);
      }
    }
  };

  /**
   * Retrieves summary details of a permission by ID.
   */
  public getPermissionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.permissionService.getPermissionById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Permission details retrieved successfully.',
        data: result,
      });
    } catch (error) {
      try {
        this.handleServiceError(error);
      } catch (mappedError) {
        next(mappedError);
      }
    }
  };

  /**
   * Creates a new custom permission.
   */
  public createPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: CreatePermissionDto = req.body;
      const result = await this.permissionService.createPermission(dto);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Permission created successfully.',
        data: result,
      });
    } catch (error) {
      try {
        this.handleServiceError(error);
      } catch (mappedError) {
        next(mappedError);
      }
    }
  };

  /**
   * Updates fields of an existing permission.
   */
  public updatePermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdatePermissionDto = req.body;
      const result = await this.permissionService.updatePermission(id, dto);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Permission updated successfully.',
        data: result,
      });
    } catch (error) {
      try {
        this.handleServiceError(error);
      } catch (mappedError) {
        next(mappedError);
      }
    }
  };

  /**
   * Soft-deletes a permission.
   */
  public deletePermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      await this.permissionService.deletePermission(id);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      try {
        this.handleServiceError(error);
      } catch (mappedError) {
        next(mappedError);
      }
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleServiceError(error: unknown): never {
    if (error instanceof PermissionNotFoundError) {
      throw new AppError(error.message, HttpStatus.NOT_FOUND);
    }
    if (
      error instanceof DuplicatePermissionNameError ||
      error instanceof DuplicatePermissionCodeError
    ) {
      throw new AppError(error.message, HttpStatus.CONFLICT);
    }
    if (error instanceof ProtectedPermissionError) {
      throw new AppError(error.message, HttpStatus.FORBIDDEN);
    }
    if (
      error instanceof InvalidPermissionUpdateError ||
      error instanceof InvalidPermissionStateError
    ) {
      throw new AppError(error.message, HttpStatus.BAD_REQUEST);
    }
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new AppError(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    throw new AppError('An unknown error occurred.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
