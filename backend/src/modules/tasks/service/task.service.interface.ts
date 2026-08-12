import {
  TaskDetailOutput,
  PaginatedTasksOutput,
  TaskFiltersInput,
} from '../repository/task.repository.types';
import {
  CreateTaskServiceInput,
  UpdateTaskServiceInput,
  FindTasksServiceOptions,
} from './task.service.types';

/**
 * Service Contract for managing Task business logic.
 * Encapsulates validations, audit tracking, and repository boundaries.
 */
export interface ITaskService {
  createTask(data: CreateTaskServiceInput, currentUserId: string): Promise<TaskDetailOutput>;
  getTaskById(id: string): Promise<TaskDetailOutput>;
  listTasks(options: FindTasksServiceOptions): Promise<PaginatedTasksOutput>;
  updateTask(
    id: string,
    data: UpdateTaskServiceInput,
    currentUserId: string
  ): Promise<TaskDetailOutput>;
  archiveTask(id: string, currentUserId: string): Promise<TaskDetailOutput>;
  restoreTask(id: string, currentUserId: string): Promise<TaskDetailOutput>;
  countTasks(filters: TaskFiltersInput): Promise<number>;
}
