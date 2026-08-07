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
 * Zod validation schema for creating a new Lead record.
 */
export const CreateLeadSchema = z
  .object({
    name: LeadNameSchema,
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
  .strict();

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;
