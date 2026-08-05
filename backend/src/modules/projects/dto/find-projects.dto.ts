import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
import { PROJECT_PAGINATION, PROJECT_SORT } from '../constants/project.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

/**
 * Zod validation schema for querying Project records.
 * Composes shared query schemas and adds project-specific filters/sorting.
 */
export const FindProjectsSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(PROJECT_PAGINATION.MAX_LIMIT, `Limit must not exceed ${PROJECT_PAGINATION.MAX_LIMIT}`)
        .optional()
    ),
    status: z.nativeEnum(ProjectStatus).optional(),
    clientId: z.string().uuid('Client ID filter must be a valid UUID.').optional(),
    projectManagerId: z.string().uuid('Project manager ID filter must be a valid UUID.').optional(),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(PROJECT_SORT.ALLOWED_FIELDS).optional(),
  })
  .strict();

export type FindProjectsDto = z.infer<typeof FindProjectsSchema>;
