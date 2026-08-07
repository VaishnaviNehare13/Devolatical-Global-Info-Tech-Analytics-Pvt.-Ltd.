import { z } from 'zod';
import { MilestoneStatus } from '@prisma/client';
import { MILESTONE_PAGINATION, MILESTONE_SORT } from '../constants/milestone.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

export const FindMilestonesSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(
          MILESTONE_PAGINATION.MAX_LIMIT,
          `Limit must not exceed ${MILESTONE_PAGINATION.MAX_LIMIT}`
        )
        .optional()
    ),
    status: z.nativeEnum(MilestoneStatus).optional(),
    projectId: z.string().uuid('Project ID filter must be a valid UUID.').optional(),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(MILESTONE_SORT.ALLOWED_FIELDS).optional(),
  })
  .strict();

export type FindMilestonesDto = z.infer<typeof FindMilestonesSchema>;
