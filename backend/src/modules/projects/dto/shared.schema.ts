import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
import { PROJECT_VALIDATION } from '../constants/project.constants';

export const ProjectNameSchema = z
  .string({ required_error: 'Project name is required.' })
  .trim()
  .min(
    PROJECT_VALIDATION.NAME_MIN_LENGTH,
    `Project name must be at least ${PROJECT_VALIDATION.NAME_MIN_LENGTH} characters.`
  )
  .max(
    PROJECT_VALIDATION.NAME_MAX_LENGTH,
    `Project name must not exceed ${PROJECT_VALIDATION.NAME_MAX_LENGTH} characters.`
  );

export const ProjectCodeSchema = z
  .string({ required_error: 'Project code is required.' })
  .trim()
  .min(
    PROJECT_VALIDATION.CODE_MIN_LENGTH,
    `Project code must be at least ${PROJECT_VALIDATION.CODE_MIN_LENGTH} characters.`
  )
  .max(
    PROJECT_VALIDATION.CODE_MAX_LENGTH,
    `Project code must not exceed ${PROJECT_VALIDATION.CODE_MAX_LENGTH} characters.`
  )
  .regex(
    /^[A-Z0-9_-]+$/,
    'Project code must contain only uppercase alphanumeric characters, dashes, and underscores.'
  );

export const ProjectDescriptionSchema = z
  .string()
  .trim()
  .max(
    PROJECT_VALIDATION.DESCRIPTION_MAX_LENGTH,
    `Description must not exceed ${PROJECT_VALIDATION.DESCRIPTION_MAX_LENGTH} characters.`
  )
  .nullable();

export const ProjectStatusSchema = z.nativeEnum(ProjectStatus, {
  invalid_type_error: 'Invalid project status format.',
});

export const ProjectBudgetSchema = z
  .preprocess(
    (val) => (val === null || val === undefined || val === '' ? null : Number(val)),
    z.number().positive('Budget must be a positive number').nullable()
  )
  .nullable();

export const ClientIdSchema = z
  .string({ required_error: 'Client ID is required.' })
  .uuid('Client ID must be a valid UUID.');

export const ProjectManagerIdSchema = z
  .string()
  .uuid('Project manager ID must be a valid UUID.')
  .nullable();

export const ProjectDateSchema = z
  .preprocess(
    (val) => (val === null || val === undefined || val === '' ? null : new Date(val as string)),
    z.date({ invalid_type_error: 'Invalid date format.' }).nullable()
  )
  .nullable();
