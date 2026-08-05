import { z } from 'zod';
import {
  ProjectNameSchema,
  ProjectCodeSchema,
  ProjectDescriptionSchema,
  ProjectStatusSchema,
  ClientIdSchema,
  ProjectManagerIdSchema,
  ProjectDateSchema,
  ProjectBudgetSchema,
} from './shared.schema';

/**
 * Zod validation schema for updating Project records.
 * Uses strict mode and requires at least one field to be present.
 * Validates date ranges if both start/end dates are provided in request body.
 */
export const UpdateProjectSchema = z
  .object({
    name: ProjectNameSchema.optional(),
    code: z
      .preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), ProjectCodeSchema)
      .optional(),
    description: ProjectDescriptionSchema.optional(),
    status: ProjectStatusSchema.optional(),
    clientId: ClientIdSchema.optional(),
    projectManagerId: ProjectManagerIdSchema.optional(),
    startDate: ProjectDateSchema.optional(),
    endDate: ProjectDateSchema.optional(),
    budget: ProjectBudgetSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'End date must not occur before start date.',
      path: ['endDate'],
    }
  );

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
