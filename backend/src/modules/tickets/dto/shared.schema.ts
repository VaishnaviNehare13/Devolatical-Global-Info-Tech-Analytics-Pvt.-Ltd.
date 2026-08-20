import { z } from 'zod';
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';
import { TICKET_VALIDATION } from '../constants/ticket.constants';

export const TicketSubjectSchema = z
  .string({ required_error: 'Ticket subject is required.' })
  .trim()
  .min(
    TICKET_VALIDATION.SUBJECT_MIN_LENGTH,
    `Ticket subject must be at least ${TICKET_VALIDATION.SUBJECT_MIN_LENGTH} characters.`
  )
  .max(
    TICKET_VALIDATION.SUBJECT_MAX_LENGTH,
    `Ticket subject must not exceed ${TICKET_VALIDATION.SUBJECT_MAX_LENGTH} characters.`
  );

export const TicketDescriptionSchema = z
  .string({ required_error: 'Ticket description is required.' })
  .trim()
  .max(
    TICKET_VALIDATION.DESCRIPTION_MAX_LENGTH,
    `Ticket description must not exceed ${TICKET_VALIDATION.DESCRIPTION_MAX_LENGTH} characters.`
  );

export const TicketStatusSchema = z.nativeEnum(TicketStatus, {
  invalid_type_error: 'Invalid ticket status format.',
});

export const TicketPrioritySchema = z.nativeEnum(TicketPriority, {
  invalid_type_error: 'Invalid ticket priority format.',
});

export const TicketCategorySchema = z.nativeEnum(TicketCategory, {
  invalid_type_error: 'Invalid ticket category format.',
});

export const TicketAssignedToIdSchema = z
  .string()
  .uuid('Assigned To ID must be a valid UUID.')
  .nullable();

export const TicketClientIdSchema = z.string().uuid('Client ID must be a valid UUID.').nullable();

export const TicketProjectIdSchema = z.string().uuid('Project ID must be a valid UUID.').nullable();

export const TicketIdParamSchema = z
  .object({
    id: z
      .string({ required_error: 'ID parameter is required.' })
      .uuid('Invalid ID format. Must be a valid UUID.'),
  })
  .strict();
