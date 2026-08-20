import { z } from 'zod';
import { JobStatus, EmploymentType } from '@prisma/client';

export const updateJobSchema = z.object({
  title: z.string().trim().min(3).optional(),
  department: z.string().trim().min(2).optional(),
  location: z.string().trim().min(2).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  salaryRange: z.string().trim().nullable().optional(),
  description: z.string().trim().min(10).optional(),
  requirements: z.string().trim().nullable().optional(),
  status: z.nativeEnum(JobStatus).optional(),
});

export type UpdateJobDTO = z.infer<typeof updateJobSchema>;
