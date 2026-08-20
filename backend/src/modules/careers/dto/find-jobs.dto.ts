import { z } from 'zod';
import { JobStatus, EmploymentType } from '@prisma/client';

export const findJobsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  includeDeleted: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  sortField: z.enum(['createdAt', 'title', 'department']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type FindJobsDTO = z.infer<typeof findJobsSchema>;
