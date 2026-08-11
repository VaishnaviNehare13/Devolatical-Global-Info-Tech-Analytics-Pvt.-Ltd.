import {
  CreateTaskRepositoryInput,
  UpdateTaskRepositoryInput,
  TaskDetailOutput,
  FindTasksRepositoryOptions,
  TaskFiltersInput,
  PaginatedTasksOutput,
  QueryOptions,
} from './task.repository.types';

export interface ITaskRepository {
  create(data: CreateTaskRepositoryInput): Promise<TaskDetailOutput>;
  findById(id: string, options?: QueryOptions): Promise<TaskDetailOutput | null>;
  findMany(options: FindTasksRepositoryOptions): Promise<PaginatedTasksOutput>;
  count(filters: TaskFiltersInput): Promise<number>;
  update(id: string, data: UpdateTaskRepositoryInput): Promise<TaskDetailOutput | null>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<TaskDetailOutput>;
}
