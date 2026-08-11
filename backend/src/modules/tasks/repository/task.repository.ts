import { PrismaClient, Prisma, TaskStatus, TaskPriority } from '@prisma/client';
import { ITaskRepository } from './task.repository.interface';
import { TASK_BASE_SELECT, TASK_DETAIL_SELECT } from './task.repository.select';
import {
  CreateTaskRepositoryInput,
  UpdateTaskRepositoryInput,
  TaskBaseOutput,
  TaskDetailOutput,
  FindTasksRepositoryOptions,
  TaskFiltersInput,
  PaginatedTasksOutput,
  QueryOptions,
} from './task.repository.types';
import { TaskRepositoryError } from './task.repository.errors';
import { TASK_PAGINATION, TASK_SORT } from '../constants/task.constants';

/**
 * Concrete Prisma-backed repository implementing the ITaskRepository contract.
 * Decouples raw Prisma operations, filters logical deletes, and handles queries.
 */
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Persists a new Task record.
   */
  public async create(data: CreateTaskRepositoryInput): Promise<TaskDetailOutput> {
    try {
      const result = await this.prisma.task.create({
        data: {
          code: data.code,
          title: data.title,
          description: data.description ?? null,
          status: data.status || TaskStatus.TODO,
          priority: data.priority || TaskPriority.MEDIUM,
          projectId: data.projectId,
          milestoneId: data.milestoneId ?? null,
          assignedToId: data.assignedToId ?? null,
          parentId: data.parentId ?? null,
          estimatedHours: data.estimatedHours ?? null,
          loggedHours: data.loggedHours ?? new Prisma.Decimal(0.0),
          dueDate: data.dueDate ?? null,
          createdById: data.createdById ?? null,
        },
        select: TASK_DETAIL_SELECT,
      });

      return result as unknown as TaskDetailOutput;
    } catch (error) {
      throw new TaskRepositoryError(
        'DATABASE_WRITE_FAILED',
        'Database write failed while creating task record.',
        error
      );
    }
  }

  /**
   * Retrieves a Task record by unique ID. Excludes soft-deleted records by default.
   */
  public async findById(id: string, options?: QueryOptions): Promise<TaskDetailOutput | null> {
    try {
      const result = await this.prisma.task.findFirst({
        where: {
          id,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: TASK_DETAIL_SELECT,
      });

      return result as unknown as TaskDetailOutput | null;
    } catch (error) {
      throw new TaskRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching task by ID ${id}.`,
        error
      );
    }
  }

  /**
   * Retrieves, filters, and paginates Task records. Excludes soft-deleted records by default.
   */
  public async findMany(options: FindTasksRepositoryOptions): Promise<PaginatedTasksOutput> {
    try {
      const page = Math.max(1, options.pagination?.page ?? TASK_PAGINATION.DEFAULT_PAGE);
      const rawLimit = options.pagination?.limit ?? TASK_PAGINATION.DEFAULT_LIMIT;
      const limit = Math.min(TASK_PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause({
        search: options.search,
        code: options.code,
        status: options.status,
        priority: options.priority,
        projectId: options.projectId,
        milestoneId: options.milestoneId,
        assignedToId: options.assignedToId,
        parentId: options.parentId,
        includeDeleted: options.includeDeleted,
      });

      const orderBy = this.buildOrderBy(options.sortField, options.sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.task.count({ where }),
        this.prisma.task.findMany({
          where,
          select: TASK_BASE_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      return {
        items: items as unknown as TaskBaseOutput[],
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new TaskRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while listing tasks.',
        error
      );
    }
  }

  /**
   * Counts Task records matching query filter. Excludes soft-deleted records by default.
   */
  public async count(filters: TaskFiltersInput): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await this.prisma.task.count({ where });
    } catch (error) {
      throw new TaskRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while counting tasks.',
        error
      );
    }
  }

  /**
   * Updates an existing Task record.
   */
  public async update(
    id: string,
    data: UpdateTaskRepositoryInput
  ): Promise<TaskDetailOutput | null> {
    try {
      const result = await this.prisma.task.update({
        where: { id },
        data: {
          code: data.code,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          projectId: data.projectId,
          milestoneId: data.milestoneId,
          assignedToId: data.assignedToId,
          parentId: data.parentId,
          estimatedHours: data.estimatedHours,
          loggedHours: data.loggedHours,
          dueDate: data.dueDate,
          updatedById: data.updatedById,
          deletedAt: data.deletedAt,
        },
        select: TASK_DETAIL_SELECT,
      });

      return result as unknown as TaskDetailOutput;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw new TaskRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating task with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Performs soft deletion of a Task record by setting the deletedAt timestamp.
   */
  public async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.task.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw new TaskRepositoryError(
        'DATABASE_DELETE_FAILED',
        `Database update failed while soft-deleting task with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Restores a soft-deleted Task record by nullifying its deletedAt timestamp.
   */
  public async restore(id: string): Promise<TaskDetailOutput> {
    try {
      const result = await this.prisma.task.update({
        where: { id },
        data: {
          deletedAt: null,
        },
        select: TASK_DETAIL_SELECT,
      });
      return result as unknown as TaskDetailOutput;
    } catch (error) {
      throw new TaskRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while restoring task with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Helper to build Prisma dynamic filters object.
   */
  private buildWhereClause(filters: TaskFiltersInput): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.code) {
      where.code = filters.code;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.milestoneId) {
      where.milestoneId = filters.milestoneId;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.parentId) {
      where.parentId = filters.parentId;
    }

    if (filters.search) {
      const searchTrim = filters.search.trim();
      where.OR = [
        { code: { contains: searchTrim, mode: 'insensitive' } },
        { title: { contains: searchTrim, mode: 'insensitive' } },
        { description: { contains: searchTrim, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Helper to build Prisma dynamic orderBy sort settings.
   */
  private buildOrderBy(
    sortField?: string,
    sortOrder?: 'asc' | 'desc'
  ): Prisma.TaskOrderByWithRelationInput {
    const field = sortField || TASK_SORT.DEFAULT_FIELD;
    const order = sortOrder || TASK_SORT.DEFAULT_ORDER;
    return { [field]: order };
  }
}
