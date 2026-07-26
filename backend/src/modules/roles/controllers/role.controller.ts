import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdateRoleStatusDto } from '../dto/update-status.dto';
import { FindRolesDto } from '../dto/find-roles.dto';
import { FindRolesOptions } from '../types/role.types';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  RoleNotFoundError,
  DuplicateRoleNameError,
  DuplicateRoleCodeError,
  ProtectedRoleError,
  InvalidRoleStatusError,
  RoleInUseError,
} from '../types/role.service.errors';

/**
 * Express Controller responsible for delegating HTTP endpoints to the RoleService layers.
 * Decoupled from service details via constructor dependency injection.
 */
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Retrieves a paginated list of roles.
   */
  public getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindRolesDto;

      const options: FindRolesOptions = {
        pagination: {
          page: query.page,
          limit: query.limit,
        },
        search: query.search,
        filters: {
          type: query.type,
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

      const result = await this.roleService.getRoles(options);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Roles list retrieved successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves summary details of a role by ID.
   */
  public getRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.roleService.getRoleById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Role details retrieved successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Creates a new Custom role.
   */
  public createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateRoleDto = req.body;
      const result = await this.roleService.createRole(dto);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Role created successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates fields of an existing role.
   */
  public updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateRoleDto = req.body;
      const result = await this.roleService.updateRole(id, dto);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Role updated successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates active state toggle of a role.
   */
  public updateRoleStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateRoleStatusDto = req.body;
      const result = await this.roleService.updateRoleStatus(id, dto.isActive);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Role status updated successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft-deletes a role.
   */
  public deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      await this.roleService.deleteRole(id);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof RoleNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (
      error instanceof DuplicateRoleNameError ||
      error instanceof DuplicateRoleCodeError ||
      error instanceof RoleInUseError
    ) {
      next(new AppError(error.message, HttpStatus.CONFLICT));
    } else if (error instanceof ProtectedRoleError) {
      next(new AppError(error.message, HttpStatus.FORBIDDEN));
    } else if (error instanceof InvalidRoleStatusError) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else {
      next(error);
    }
  }
}
