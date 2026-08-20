import { z } from 'zod';
import { JobStatus, EmploymentType } from '@prisma/client';

export const createJobSchema = z.object({
  title: z.string().trim().min(3, 'Job title must be at least 3 characters'),
  department: z.string().trim().min(2, 'Department name is required'),
  location: z.string().trim().min(2, 'Location is required'),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
  salaryRange: z.string().trim().nullable().optional(),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().trim().nullable().optional(),
  status: z.nativeEnum(JobStatus).default(JobStatus.ACTIVE),
});

export type CreateJobDTO = z.infer<typeof createJobSchema>;
