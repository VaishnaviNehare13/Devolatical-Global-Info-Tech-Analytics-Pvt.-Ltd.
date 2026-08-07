import { z } from 'zod';
import { LeadStatus, LeadPriority, LeadSource } from '@prisma/client';
import { LEAD_PAGINATION, LEAD_SORT } from '../constants/lead.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

/**
 * Zod validation schema for querying Lead records.
 * Composes shared query schemas and adds lead-specific filters/sorting.
 */
export const FindLeadsSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(LEAD_PAGINATION.MAX_LIMIT, `Limit must not exceed ${LEAD_PAGINATION.MAX_LIMIT}`)
        .optional()
    ),
    status: z.nativeEnum(LeadStatus).optional(),
    priority: z.nativeEnum(LeadPriority).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    assignedToId: z.string().uuid('Assigned To ID filter must be a valid UUID.').optional(),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(LEAD_SORT.ALLOWED_FIELDS).optional(),
  })
  .strict();

export type FindLeadsDto = z.infer<typeof FindLeadsSchema>;
