import { z } from 'zod';
import { MilestoneStatus } from '@prisma/client';
import { MILESTONE_VALIDATION } from '../constants/milestone.constants';

export const MilestoneTitleSchema = z
  .string({ required_error: 'Milestone title is required.' })
  .trim()
  .min(
    MILESTONE_VALIDATION.TITLE_MIN_LENGTH,
    `Milestone title must be at least ${MILESTONE_VALIDATION.TITLE_MIN_LENGTH} characters.`
  )
  .max(
    MILESTONE_VALIDATION.TITLE_MAX_LENGTH,
    `Milestone title must not exceed ${MILESTONE_VALIDATION.TITLE_MAX_LENGTH} characters.`
  );

export const MilestoneDescriptionSchema = z
  .string()
  .trim()
  .max(
    MILESTONE_VALIDATION.DESCRIPTION_MAX_LENGTH,
    `Description must not exceed ${MILESTONE_VALIDATION.DESCRIPTION_MAX_LENGTH} characters.`
  )
  .nullable();

export const MilestoneStatusSchema = z.nativeEnum(MilestoneStatus, {
  invalid_type_error: 'Invalid milestone status format.',
});

export const ProjectIdSchema = z
  .string({ required_error: 'Project ID is required.' })
  .uuid('Project ID must be a valid UUID.');

export const MilestoneDateSchema = z
  .preprocess(
    (val) => (val === null || val === undefined || val === '' ? null : new Date(val as string)),
    z.date({ invalid_type_error: 'Invalid date format.' }).nullable()
  )
  .nullable();

export const MilestoneIdParamSchema = z
  .object({
    id: z
      .string({ required_error: 'ID parameter is required.' })
      .uuid('Invalid ID format. Must be a valid UUID.'),
    projectId: z.string().uuid('Project ID must be a valid UUID.').optional(),
  })
  .strict();
