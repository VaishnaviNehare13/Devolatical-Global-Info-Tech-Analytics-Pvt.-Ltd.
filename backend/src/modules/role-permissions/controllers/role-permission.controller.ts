import { Request, Response, NextFunction } from 'express';
import { RolePermissionService } from '../services/role-permission.service';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { ReplacePermissionsDto } from '../dto/replace-permissions.dto';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  MappingNotFoundError,
  RolePermissionAlreadyExistsError,
  ProtectedRoleMappingError,
  InvalidMappingUpdateError,
  InvalidMappingStateError,
} from '../types/role-permission.service.errors';

/**
 * Express Controller responsible for delegating HTTP endpoints to the RolePermissionService layers.
 * Decoupled from service details via constructor dependency injection.
 */
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  /**
   * Retrieves a list of permissions mapped to a specific role.
   */
  public getRolePermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const roleId = req.params.roleId;
      const result = await this.rolePermissionService.getRolePermissions(roleId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Role permissions retrieved successfully.',
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
   * Assigns a list of permissions to a role.
   */
  public assignPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const roleId = req.params.roleId;
      const dto: AssignPermissionsDto = req.body;
      const result = await this.rolePermissionService.assignPermissions(
        roleId,
        dto.permissionIds,
        dto.isGranted
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Permissions assigned successfully.',
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
   * Synchronizes/replaces mappings for a role.
   */
  public replacePermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const roleId = req.params.roleId;
      const dto: ReplacePermissionsDto = req.body;
      const result = await this.rolePermissionService.replacePermissions(
        roleId,
        dto.permissionIds,
        dto.isGranted
      );

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Role permissions synchronized successfully.',
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
   * Revokes a specific permission assignment from a role.
   */
  public removePermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { roleId, permissionId } = req.params;
      await this.rolePermissionService.removePermission(roleId, permissionId);

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
   * Translates service exceptions into HTTP-layer AppError exceptions.
   */
  private handleServiceError(error: unknown): never {
    if (error instanceof MappingNotFoundError) {
      throw new AppError(error.message, HttpStatus.NOT_FOUND);
    }
    if (error instanceof RolePermissionAlreadyExistsError) {
      throw new AppError(error.message, HttpStatus.CONFLICT);
    }
    if (error instanceof ProtectedRoleMappingError) {
      throw new AppError(error.message, HttpStatus.FORBIDDEN);
    }
    if (error instanceof InvalidMappingUpdateError || error instanceof InvalidMappingStateError) {
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
