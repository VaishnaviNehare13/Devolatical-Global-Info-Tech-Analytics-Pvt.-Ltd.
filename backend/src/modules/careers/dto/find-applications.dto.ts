import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const findApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  jobId: z.string().uuid().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  includeDeleted: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  sortField: z.enum(['createdAt', 'applicantName', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type FindApplicationsDTO = z.infer<typeof findApplicationsSchema>;
