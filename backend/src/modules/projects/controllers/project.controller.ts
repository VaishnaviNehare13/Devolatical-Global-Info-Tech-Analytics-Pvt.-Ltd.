import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { IProjectService } from '../service/project.service.interface';
import { ProjectMapper } from '../mappers/project.mapper';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { FindProjectsDto } from '../dto/find-projects.dto';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  ProjectNotFoundError,
  ProjectAlreadyExistsError,
  ClientNotFoundError,
  ProjectManagerNotFoundError,
  InvalidStatusTransitionError,
  ProjectArchivedError,
  InvalidDateRangeError,
} from '../service/project.service.errors';

/**
 * Express Controller responsible for delegating project-specific HTTP endpoints
 * to the IProjectService business layer.
 * Decoupled from service implementation details via interface constructor injection.
 */
export class ProjectController {
  constructor(private readonly projectService: IProjectService) {}

  /**
   * Creates a new project.
   */
  public createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateProjectDto = req.body;
      const userId = req.user!.id;
      const result = await this.projectService.createProject(
        {
          ...dto,
          budget:
            dto.budget !== null && dto.budget !== undefined
              ? new Prisma.Decimal(dto.budget)
              : dto.budget,
        },
        userId
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Project created successfully.',
        data: ProjectMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a project by unique ID.
   */
  public getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.projectService.getProjectById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Project details retrieved successfully.',
        data: ProjectMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a paginated list of projects matching filtering options.
   */
  public listProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindProjectsDto;
      const result = await this.projectService.listProjects({
        pagination:
          query.page && query.limit
            ? {
                page: query.page,
                limit: query.limit,
              }
            : undefined,
        search: query.search,
        status: query.status,
        clientId: query.clientId,
        projectManagerId: query.projectManagerId,
        includeDeleted: query.includeDeleted,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Projects list retrieved successfully.',
        data: ProjectMapper.toPaginatedResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates an existing active project profile.
   */
  public updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateProjectDto = req.body;
      const userId = req.user!.id;
      const result = await this.projectService.updateProject(
        id,
        {
          ...dto,
          budget:
            dto.budget !== null && dto.budget !== undefined
              ? new Prisma.Decimal(dto.budget)
              : dto.budget,
        },
        userId
      );

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Project updated successfully.',
        data: ProjectMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft deletes / archives a project. Returns NO_CONTENT.
   */
  public archiveProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      await this.projectService.archiveProject(id, userId);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Restores an archived project back to PLANNING status.
   */
  public restoreProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const result = await this.projectService.restoreProject(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Project restored successfully.',
        data: ProjectMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof ProjectNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (error instanceof ProjectAlreadyExistsError) {
      next(new AppError(error.message, HttpStatus.CONFLICT));
    } else if (
      error instanceof ClientNotFoundError ||
      error instanceof ProjectManagerNotFoundError ||
      error instanceof InvalidStatusTransitionError ||
      error instanceof ProjectArchivedError ||
      error instanceof InvalidDateRangeError
    ) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else {
      next(error);
    }
  }
}
