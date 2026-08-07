import { z } from 'zod';
import {
  MilestoneTitleSchema,
  MilestoneDescriptionSchema,
  ProjectIdSchema,
  MilestoneStatusSchema,
  MilestoneDateSchema,
} from './shared.schema';

export const CreateMilestoneSchema = z
  .object({
    title: MilestoneTitleSchema,
    description: MilestoneDescriptionSchema.optional(),
    projectId: ProjectIdSchema,
    status: MilestoneStatusSchema.optional(),
    dueDate: MilestoneDateSchema.optional(),
  })
  .strict();

export type CreateMilestoneDto = z.infer<typeof CreateMilestoneSchema>;
