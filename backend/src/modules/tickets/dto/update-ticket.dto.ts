import { z } from 'zod';
import {
  TicketSubjectSchema,
  TicketDescriptionSchema,
  TicketStatusSchema,
  TicketPrioritySchema,
  TicketAssignedToIdSchema,
  TicketClientIdSchema,
  TicketProjectIdSchema,
} from './shared.schema';

/**
 * Zod validation schema for updating Ticket records.
 * Uses strict mode and requires at least one field to be present.
 */
export const UpdateTicketSchema = z
  .object({
    subject: TicketSubjectSchema.optional(),
    description: TicketDescriptionSchema.optional(),
    status: TicketStatusSchema.optional(),
    priority: TicketPrioritySchema.optional(),
    assignedToId: TicketAssignedToIdSchema.optional(),
    clientId: TicketClientIdSchema.optional(),
    projectId: TicketProjectIdSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdateTicketDto = z.infer<typeof UpdateTicketSchema>;
