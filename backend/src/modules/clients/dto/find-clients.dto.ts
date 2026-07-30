import { z } from 'zod';
import { ClientStatus } from '@prisma/client';
import { CLIENT_PAGINATION, CLIENT_SORT } from '../constants/client.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

/**
 * Zod validation schema for querying Client records.
 * Composes shared query schemas and adds client-specific filters/sorting.
 */
export const FindClientsSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(CLIENT_PAGINATION.MAX_LIMIT, `Limit must not exceed ${CLIENT_PAGINATION.MAX_LIMIT}`)
        .optional()
    ),
    status: z.nativeEnum(ClientStatus).optional(),
    accountManagerId: z.string().uuid('Account manager ID filter must be a valid UUID.').optional(),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(CLIENT_SORT.ALLOWED_FIELDS).optional(),
  })
  .strict();

export type FindClientsDto = z.infer<typeof FindClientsSchema>;
