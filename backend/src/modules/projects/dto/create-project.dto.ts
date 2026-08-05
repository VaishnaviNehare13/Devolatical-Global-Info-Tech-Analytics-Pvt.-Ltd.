import { z } from 'zod';
import {
  ProjectNameSchema,
  ProjectCodeSchema,
  ProjectDescriptionSchema,
  ClientIdSchema,
  ProjectManagerIdSchema,
  ProjectDateSchema,
  ProjectBudgetSchema,
} from './shared.schema';

/**
 * Zod validation schema for creating a new Project record.
 * Normalizes alphanumeric project code to uppercase.
 * Enforces start date occurs before end date constraint.
 */
export const CreateProjectSchema = z
  .object({
    name: ProjectNameSchema,
    code: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      ProjectCodeSchema
    ),
    description: ProjectDescriptionSchema.optional(),
    clientId: ClientIdSchema,
    projectManagerId: ProjectManagerIdSchema.optional(),
    startDate: ProjectDateSchema.optional(),
    endDate: ProjectDateSchema.optional(),
    budget: ProjectBudgetSchema.optional(),
  })
  .strict()
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

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
