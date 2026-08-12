import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ITaskService } from '../service/task.service.interface';
import { TaskMapper } from '../mappers/task.mapper';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { FindTasksDto } from '../dto/find-tasks.dto';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  TaskNotFoundError,
  TaskArchivedError,
  InvalidStatusTransitionError,
  TaskAssigneeNotFoundError,
  ProjectNotFoundError,
  ProjectArchivedError,
  MilestoneNotFoundError,
  MilestoneArchivedError,
  ParentTaskNotFoundError,
  ParentTaskArchivedError,
  InvalidParentTaskError,
  InvalidTaskProjectRelationError,
} from '../service/task.service.errors';

/**
 * Express Controller responsible for delegating task-specific HTTP endpoints
 * to the ITaskService business layer.
 * Decoupled from service implementation details via interface constructor injection.
 */
export class TaskController {
  constructor(private readonly taskService: ITaskService) {}

  /**
   * Creates a new task.
   */
  public createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateTaskDto = req.body;
      const userId = req.user!.id;
      const result = await this.taskService.createTask(
        {
          ...dto,
          estimatedHours:
            dto.estimatedHours !== null && dto.estimatedHours !== undefined
              ? new Prisma.Decimal(dto.estimatedHours)
              : dto.estimatedHours,
          loggedHours:
            dto.loggedHours !== undefined ? new Prisma.Decimal(dto.loggedHours) : undefined,
        },
        userId
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Task created successfully.',
        data: TaskMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a task by unique ID.
   */
  public getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.taskService.getTaskById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Task details retrieved successfully.',
        data: TaskMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a paginated list of tasks matching filtering options.
   */
  public listTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindTasksDto;
      const result = await this.taskService.listTasks({
        pagination:
          query.page && query.limit
            ? {
                page: query.page,
                limit: query.limit,
              }
            : undefined,
        search: query.search,
        code: query.code,
        status: query.status,
        priority: query.priority,
        projectId: query.projectId,
        milestoneId: query.milestoneId,
        assignedToId: query.assignedToId,
        parentId: query.parentId,
        includeDeleted: query.includeDeleted,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Tasks list retrieved successfully.',
        data: TaskMapper.toPaginatedResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates an existing active task.
   */
  public updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateTaskDto = req.body;
      const userId = req.user!.id;
      const result = await this.taskService.updateTask(
        id,
        {
          ...dto,
          estimatedHours:
            dto.estimatedHours !== null && dto.estimatedHours !== undefined
              ? new Prisma.Decimal(dto.estimatedHours)
              : dto.estimatedHours,
          loggedHours:
            dto.loggedHours !== undefined ? new Prisma.Decimal(dto.loggedHours) : undefined,
        },
        userId
      );

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Task updated successfully.',
        data: TaskMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft deletes / archives a task. Returns NO_CONTENT.
   */
  public archiveTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      await this.taskService.archiveTask(id, userId);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Restores an archived task back to active status.
   */
  public restoreTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const result = await this.taskService.restoreTask(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Task restored successfully.',
        data: TaskMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof TaskNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (
      error instanceof TaskArchivedError ||
      error instanceof InvalidStatusTransitionError ||
      error instanceof TaskAssigneeNotFoundError ||
      error instanceof ProjectNotFoundError ||
      error instanceof ProjectArchivedError ||
      error instanceof MilestoneNotFoundError ||
      error instanceof MilestoneArchivedError ||
      error instanceof ParentTaskNotFoundError ||
      error instanceof ParentTaskArchivedError ||
      error instanceof InvalidParentTaskError ||
      error instanceof InvalidTaskProjectRelationError
    ) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else {
      next(error);
    }
  }
}
