import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { TASK_VALIDATION } from '../constants/task.constants';

export const TaskCodeSchema = z
  .string({ required_error: 'Task code is required.' })
  .trim()
  .min(
    TASK_VALIDATION.CODE_MIN_LENGTH,
    `Task code must be at least ${TASK_VALIDATION.CODE_MIN_LENGTH} characters.`
  )
  .max(
    TASK_VALIDATION.CODE_MAX_LENGTH,
    `Task code must not exceed ${TASK_VALIDATION.CODE_MAX_LENGTH} characters.`
  )
  .regex(
    /^[A-Z0-9_-]+$/,
    'Task code must contain only uppercase alphanumeric characters, dashes, and underscores.'
  );

export const TaskTitleSchema = z
  .string({ required_error: 'Task title is required.' })
  .trim()
  .min(
    TASK_VALIDATION.TITLE_MIN_LENGTH,
    `Task title must be at least ${TASK_VALIDATION.TITLE_MIN_LENGTH} characters.`
  )
  .max(
    TASK_VALIDATION.TITLE_MAX_LENGTH,
    `Task title must not exceed ${TASK_VALIDATION.TITLE_MAX_LENGTH} characters.`
  );

export const TaskDescriptionSchema = z
  .string()
  .trim()
  .max(
    TASK_VALIDATION.DESCRIPTION_MAX_LENGTH,
    `Task description must not exceed ${TASK_VALIDATION.DESCRIPTION_MAX_LENGTH} characters.`
  )
  .nullable();

export const TaskStatusSchema = z.nativeEnum(TaskStatus, {
  invalid_type_error: 'Invalid task status format.',
});

export const TaskPrioritySchema = z.nativeEnum(TaskPriority, {
  invalid_type_error: 'Invalid task priority format.',
});

export const TaskProjectIdSchema = z
  .string({ required_error: 'Project ID is required.' })
  .uuid('Project ID must be a valid UUID.');

export const TaskMilestoneIdSchema = z
  .string()
  .uuid('Milestone ID must be a valid UUID.')
  .nullable();

export const TaskAssignedToIdSchema = z
  .string()
  .uuid('Assigned To ID must be a valid UUID.')
  .nullable();

export const TaskParentIdSchema = z.string().uuid('Parent ID must be a valid UUID.').nullable();

export const TaskEstimatedHoursSchema = z
  .preprocess(
    (val) => (val === null || val === undefined || val === '' ? null : Number(val)),
    z.number().positive('Estimated hours must be a positive number (greater than zero).').nullable()
  )
  .nullable();

export const TaskLoggedHoursSchema = z.preprocess(
  (val) => (val === null || val === undefined || val === '' ? 0 : Number(val)),
  z.number().min(0, 'Logged hours must not be negative.')
);

export const TaskDueDateSchema = z
  .preprocess(
    (val) => (val === null || val === undefined || val === '' ? null : new Date(val as string)),
    z.date({ invalid_type_error: 'Invalid date format.' }).nullable()
  )
  .nullable();

export const TaskIdParamSchema = z
  .object({
    id: z
      .string({ required_error: 'ID parameter is required.' })
      .uuid('Invalid ID format. Must be a valid UUID.'),
  })
  .strict();
