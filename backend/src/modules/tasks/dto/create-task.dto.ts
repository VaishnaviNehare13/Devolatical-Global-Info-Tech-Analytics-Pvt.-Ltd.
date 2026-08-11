import { z } from 'zod';
import {
  TaskCodeSchema,
  TaskTitleSchema,
  TaskDescriptionSchema,
  TaskStatusSchema,
  TaskPrioritySchema,
  TaskProjectIdSchema,
  TaskMilestoneIdSchema,
  TaskAssignedToIdSchema,
  TaskParentIdSchema,
  TaskEstimatedHoursSchema,
  TaskLoggedHoursSchema,
  TaskDueDateSchema,
} from './shared.schema';

/**
 * Zod validation schema for creating a new Task record.
 */
export const CreateTaskSchema = z
  .object({
    code: TaskCodeSchema,
    title: TaskTitleSchema,
    description: TaskDescriptionSchema.optional(),
    status: TaskStatusSchema.optional(),
    priority: TaskPrioritySchema.optional(),
    projectId: TaskProjectIdSchema,
    milestoneId: TaskMilestoneIdSchema.optional(),
    assignedToId: TaskAssignedToIdSchema.optional(),
    parentId: TaskParentIdSchema.optional(),
    estimatedHours: TaskEstimatedHoursSchema.optional(),
    loggedHours: TaskLoggedHoursSchema.optional(),
    dueDate: TaskDueDateSchema.optional(),
  })
  .strict();

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
