import { z } from 'zod';

export const createApplicationSchema = z.object({
  applicantName: z.string().trim().min(2, 'Applicant name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address format'),
  phone: z.string().trim().nullable().optional(),
  portfolioUrl: z
    .string()
    .trim()
    .url('Invalid portfolio or GitHub URL')
    .or(z.literal(''))
    .nullable()
    .optional(),
  coverMessage: z.string().trim().nullable().optional(),
});

export type CreateApplicationDTO = z.infer<typeof createApplicationSchema>;
