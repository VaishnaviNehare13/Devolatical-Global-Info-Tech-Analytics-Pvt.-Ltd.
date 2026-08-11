import { z } from 'zod';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { TICKET_PAGINATION, TICKET_SORT } from '../constants/ticket.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

/**
 * Zod validation schema for querying Ticket records.
 * Composes shared query schemas and adds ticket-specific filters/sorting.
 */
export const FindTicketsSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(TICKET_PAGINATION.MAX_LIMIT, `Limit must not exceed ${TICKET_PAGINATION.MAX_LIMIT}`)
        .optional()
    ),
    status: z.nativeEnum(TicketStatus).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    assignedToId: z.string().uuid('Assigned To ID filter must be a valid UUID.').optional(),
    clientId: z.string().uuid('Client ID filter must be a valid UUID.').optional(),
    projectId: z.string().uuid('Project ID filter must be a valid UUID.').optional(),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(TICKET_SORT.ALLOWED_FIELDS).optional(),
  })
  .strict();

export type FindTicketsDto = z.infer<typeof FindTicketsSchema>;
