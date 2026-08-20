import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const updateApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  notes: z.string().trim().nullable().optional(),
});

export type UpdateApplicationDTO = z.infer<typeof updateApplicationSchema>;
