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
 * Zod validation schema for updating Task records.
 * Uses strict mode and requires at least one field to be present.
 */
export const UpdateTaskSchema = z
  .object({
    code: TaskCodeSchema.optional(),
    title: TaskTitleSchema.optional(),
    description: TaskDescriptionSchema.optional(),
    status: TaskStatusSchema.optional(),
    priority: TaskPrioritySchema.optional(),
    projectId: TaskProjectIdSchema.optional(),
    milestoneId: TaskMilestoneIdSchema.optional(),
    assignedToId: TaskAssignedToIdSchema.optional(),
    parentId: TaskParentIdSchema.optional(),
    estimatedHours: TaskEstimatedHoursSchema.optional(),
    loggedHours: TaskLoggedHoursSchema.optional(),
    dueDate: TaskDueDateSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
