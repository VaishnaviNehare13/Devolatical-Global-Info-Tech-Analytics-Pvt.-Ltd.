import {
  TaskBaseOutput,
  TaskDetailOutput,
  PaginatedTasksOutput,
} from '../repository/task.repository.types';

export interface TaskSummaryResponse {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  projectId: string;
  milestoneId: string | null;
  assignedToId: string | null;
  parentId: string | null;
  estimatedHours: number | null;
  loggedHours: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetailResponse extends TaskSummaryResponse {
  description: string | null;
}

export interface PaginatedTasksResponse {
  items: TaskSummaryResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Pure Mapper responsible for transforming Tasks service outputs into API response structures.
 * Contains no business logic, database queries, or framework-specific objects.
 */
export class TaskMapper {
  /**
   * Transforms a base task summary output into a presentation-safe response model.
   */
  public static toSummaryResponse(task: TaskBaseOutput): TaskSummaryResponse {
    return {
      id: task.id,
      code: task.code,
      title: task.title,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      milestoneId: task.milestoneId,
      assignedToId: task.assignedToId,
      parentId: task.parentId,
      estimatedHours: task.estimatedHours ? Number(task.estimatedHours) : null,
      loggedHours: Number(task.loggedHours),
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  /**
   * Transforms a detailed task output into a presentation-safe response model.
   * Excludes internal database properties (like deletedAt, createdById, updatedById).
   */
  public static toDetailResponse(task: TaskDetailOutput): TaskDetailResponse {
    return {
      id: task.id,
      code: task.code,
      title: task.title,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      milestoneId: task.milestoneId,
      assignedToId: task.assignedToId,
      parentId: task.parentId,
      estimatedHours: task.estimatedHours ? Number(task.estimatedHours) : null,
      loggedHours: Number(task.loggedHours),
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      description: task.description,
    };
  }

  /**
   * Transforms a paginated task list output into a presentation-safe response model.
   */
  public static toPaginatedResponse(paginated: PaginatedTasksOutput): PaginatedTasksResponse {
    return {
      items: paginated.items.map((item) => this.toSummaryResponse(item)),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
    };
  }
}
