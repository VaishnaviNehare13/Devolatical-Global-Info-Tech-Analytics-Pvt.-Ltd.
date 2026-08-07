import { Request, Response, NextFunction } from 'express';
import { IMilestoneService } from '../service/milestone.service.interface';
import { MilestoneMapper } from '../mappers/milestone.mapper';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/update-milestone.dto';
import { FindMilestonesDto } from '../dto/find-milestones.dto';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  MilestoneNotFoundError,
  MilestoneAlreadyExistsError,
  MilestoneArchivedError,
  InvalidStatusTransitionError,
  ProjectNotFoundError,
  ProjectArchivedError,
} from '../service/milestone.service.errors';

/**
 * Express Controller responsible for delegating milestone-specific HTTP endpoints
 * to the IMilestoneService business layer.
 * Decoupled from service implementation details via interface constructor injection.
 */
export class MilestoneController {
  constructor(private readonly milestoneService: IMilestoneService) {}

  /**
   * Creates a new milestone.
   */
  public createMilestone = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: CreateMilestoneDto = req.body;
      const userId = req.user!.id;
      const result = await this.milestoneService.createMilestone(dto, userId);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Milestone created successfully.',
        data: MilestoneMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a milestone by unique ID.
   */
  public getMilestoneById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.milestoneService.getMilestoneById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Milestone details retrieved successfully.',
        data: MilestoneMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a paginated list of milestones matching filtering options.
   */
  public listMilestones = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as unknown as FindMilestonesDto;
      const result = await this.milestoneService.listMilestones({
        pagination:
          query.page && query.limit
            ? {
                page: query.page,
                limit: query.limit,
              }
            : undefined,
        search: query.search,
        status: query.status,
        projectId: query.projectId,
        includeDeleted: query.includeDeleted,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Milestones list retrieved successfully.',
        data: MilestoneMapper.toPaginatedResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates an existing active milestone profile.
   */
  public updateMilestone = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateMilestoneDto = req.body;
      const userId = req.user!.id;
      const result = await this.milestoneService.updateMilestone(id, dto, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Milestone updated successfully.',
        data: MilestoneMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft deletes / archives a milestone. Returns NO_CONTENT.
   */
  public archiveMilestone = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      await this.milestoneService.archiveMilestone(id, userId);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Restores an archived milestone back to PENDING status.
   */
  public restoreMilestone = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const result = await this.milestoneService.restoreMilestone(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Milestone restored successfully.',
        data: MilestoneMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof MilestoneNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (error instanceof MilestoneAlreadyExistsError) {
      next(new AppError(error.message, HttpStatus.CONFLICT));
    } else if (
      error instanceof ProjectNotFoundError ||
      error instanceof ProjectArchivedError ||
      error instanceof MilestoneArchivedError ||
      error instanceof InvalidStatusTransitionError
    ) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else {
      next(error);
    }
  }
}
