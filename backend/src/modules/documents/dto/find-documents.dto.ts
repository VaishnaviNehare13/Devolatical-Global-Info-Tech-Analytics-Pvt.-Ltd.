import { z } from 'zod';
import { DOCUMENT_PAGINATION, DOCUMENT_SORT } from '../constants/document.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

/**
 * Zod validation schema for querying Document records with pagination, search, and filters.
 */
export const FindDocumentsSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(
          DOCUMENT_PAGINATION.MAX_LIMIT,
          `Limit must not exceed ${DOCUMENT_PAGINATION.MAX_LIMIT}`
        )
        .optional()
    ),
    title: z.string().optional(),
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
    clientId: z.string().uuid('Client ID filter must be a valid UUID.').optional(),
    projectId: z.string().uuid('Project ID filter must be a valid UUID.').optional(),
    milestoneId: z.string().uuid('Milestone ID filter must be a valid UUID.').optional(),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(DOCUMENT_SORT.ALLOWED_FIELDS).optional(),
  })
  .strict();

export type FindDocumentsDto = z.infer<typeof FindDocumentsSchema>;
