import { z } from 'zod';
import {
  MilestoneTitleSchema,
  MilestoneDescriptionSchema,
  MilestoneStatusSchema,
  MilestoneDateSchema,
} from './shared.schema';

export const UpdateMilestoneSchema = z
  .object({
    title: MilestoneTitleSchema.optional(),
    description: MilestoneDescriptionSchema.optional(),
    status: MilestoneStatusSchema.optional(),
    dueDate: MilestoneDateSchema.optional(),
    completedAt: MilestoneDateSchema.optional(),
  })
  .strict();

export type UpdateMilestoneDto = z.infer<typeof UpdateMilestoneSchema>;
