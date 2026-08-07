import { z } from 'zod';
import { LeadStatus, LeadPriority, LeadSource } from '@prisma/client';
import { LEAD_VALIDATION } from '../constants/lead.constants';

export const LeadNameSchema = z
  .string({ required_error: 'Lead name is required.' })
  .trim()
  .min(
    LEAD_VALIDATION.NAME_MIN_LENGTH,
    `Lead name must be at least ${LEAD_VALIDATION.NAME_MIN_LENGTH} characters.`
  )
  .max(
    LEAD_VALIDATION.NAME_MAX_LENGTH,
    `Lead name must not exceed ${LEAD_VALIDATION.NAME_MAX_LENGTH} characters.`
  );

export const LeadCompanyNameSchema = z
  .string()
  .trim()
  .max(
    LEAD_VALIDATION.COMPANY_MAX_LENGTH,
    `Company name must not exceed ${LEAD_VALIDATION.COMPANY_MAX_LENGTH} characters.`
  )
  .nullable();

export const LeadEmailSchema = z
  .string()
  .trim()
  .max(
    LEAD_VALIDATION.EMAIL_MAX_LENGTH,
    `Email must not exceed ${LEAD_VALIDATION.EMAIL_MAX_LENGTH} characters.`
  )
  .email('Invalid email address format.')
  .nullable();

export const LeadPhoneSchema = z
  .string()
  .trim()
  .max(
    LEAD_VALIDATION.PHONE_MAX_LENGTH,
    `Phone number must not exceed ${LEAD_VALIDATION.PHONE_MAX_LENGTH} characters.`
  )
  .nullable();

export const LeadStatusSchema = z.nativeEnum(LeadStatus, {
  invalid_type_error: 'Invalid lead status format.',
});

export const LeadPrioritySchema = z.nativeEnum(LeadPriority, {
  invalid_type_error: 'Invalid lead priority format.',
});

export const LeadSourceSchema = z
  .nativeEnum(LeadSource, {
    invalid_type_error: 'Invalid lead source format.',
  })
  .nullable();

export const LeadIndustrySchema = z
  .string()
  .trim()
  .max(
    LEAD_VALIDATION.INDUSTRY_MAX_LENGTH,
    `Industry must not exceed ${LEAD_VALIDATION.INDUSTRY_MAX_LENGTH} characters.`
  )
  .nullable();

export const LeadNotesSchema = z
  .string()
  .trim()
  .max(
    LEAD_VALIDATION.NOTES_MAX_LENGTH,
    `Notes must not exceed ${LEAD_VALIDATION.NOTES_MAX_LENGTH} characters.`
  )
  .nullable();

export const LeadAssignedToIdSchema = z
  .string()
  .uuid('Assigned To ID must be a valid UUID.')
  .nullable();

export const LeadIdParamSchema = z
  .object({
    id: z
      .string({ required_error: 'ID parameter is required.' })
      .uuid('Invalid ID format. Must be a valid UUID.'),
  })
  .strict();
