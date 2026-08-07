import { z } from 'zod';
import {
  LeadNameSchema,
  LeadCompanyNameSchema,
  LeadEmailSchema,
  LeadPhoneSchema,
  LeadStatusSchema,
  LeadPrioritySchema,
  LeadSourceSchema,
  LeadIndustrySchema,
  LeadNotesSchema,
  LeadAssignedToIdSchema,
} from './shared.schema';

/**
 * Zod validation schema for updating Lead records.
 * Uses strict mode and requires at least one field to be present.
 */
export const UpdateLeadSchema = z
  .object({
    name: LeadNameSchema.optional(),
    companyName: LeadCompanyNameSchema.optional(),
    email: LeadEmailSchema.optional(),
    phone: LeadPhoneSchema.optional(),
    status: LeadStatusSchema.optional(),
    priority: LeadPrioritySchema.optional(),
    source: LeadSourceSchema.optional(),
    industry: LeadIndustrySchema.optional(),
    notes: LeadNotesSchema.optional(),
    assignedToId: LeadAssignedToIdSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>;
