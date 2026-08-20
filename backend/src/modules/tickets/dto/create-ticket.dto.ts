import { z } from 'zod';
import {
  TicketSubjectSchema,
  TicketDescriptionSchema,
  TicketStatusSchema,
  TicketPrioritySchema,
  TicketCategorySchema,
  TicketAssignedToIdSchema,
  TicketClientIdSchema,
  TicketProjectIdSchema,
} from './shared.schema';

/**
 * Zod validation schema for creating a new Ticket record.
 */
export const CreateTicketSchema = z
  .object({
    subject: TicketSubjectSchema,
    description: TicketDescriptionSchema,
    status: TicketStatusSchema.optional(),
    priority: TicketPrioritySchema.optional(),
    category: TicketCategorySchema.optional(),
    assignedToId: TicketAssignedToIdSchema.optional(),
    clientId: TicketClientIdSchema.optional(),
    projectId: TicketProjectIdSchema.optional(),
  })
  .strict();

export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;
