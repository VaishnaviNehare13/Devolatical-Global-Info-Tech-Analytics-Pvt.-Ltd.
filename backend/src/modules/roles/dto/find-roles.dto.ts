import { z } from 'zod';
import { ROLE_PAGINATION } from '../constants/role.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

/**
 * Zod validation schema for querying role records list.
 * Composes shared query schemas and adds role-specific filters/sorting.
 */
export const FindRolesSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(ROLE_PAGINATION.MAX_LIMIT, `Limit must not exceed ${ROLE_PAGINATION.MAX_LIMIT}`)
        .optional()
    ),
    type: z.enum(['SYSTEM', 'CUSTOM'] as const).optional(),
    isActive: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (val === undefined || val === '') return undefined;
        return val;
      },
      z.boolean({ invalid_type_error: 'isActive must be a boolean.' }).optional()
    ),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(['createdAt', 'name', 'code', 'priority'] as const).optional(),
  })
  .strict();

export type FindRolesDto = z.infer<typeof FindRolesSchema>;
