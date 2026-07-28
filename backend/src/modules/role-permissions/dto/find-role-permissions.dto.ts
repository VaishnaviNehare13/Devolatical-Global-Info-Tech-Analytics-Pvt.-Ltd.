import { z } from 'zod';
import { ROLE_PERMISSION_PAGINATION } from '../constants/role-permission.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

/**
 * Zod validation schema for listing/searching role permission mappings.
 * Reuses shared pagination, search, and sort validation schemas.
 */
export const FindRolePermissionsSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(
          ROLE_PERMISSION_PAGINATION.MAX_LIMIT,
          `Limit must not exceed ${ROLE_PERMISSION_PAGINATION.MAX_LIMIT}`
        )
        .optional()
    ),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    isGranted: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (val === undefined || val === '') return undefined;
        return val;
      },
      z.boolean({ invalid_type_error: 'isGranted must be a boolean.' }).optional()
    ),
    sortField: z
      .enum(['createdAt', 'permissionName', 'permissionCode', 'displayOrder'] as const)
      .optional(),
  })
  .strict();

export type FindRolePermissionsQueryDto = z.infer<typeof FindRolePermissionsSchema>;
