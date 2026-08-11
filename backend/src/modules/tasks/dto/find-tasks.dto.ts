import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { TASK_PAGINATION, TASK_SORT } from '../constants/task.constants';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import { SortQuerySchema } from '../../../shared/dto/sort-query.dto';

/**
 * Zod validation schema for querying Task records.
 * Composes shared query schemas and adds task-specific filters/sorting.
 */
export const FindTasksSchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .merge(SortQuerySchema)
  .extend({
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(TASK_PAGINATION.MAX_LIMIT, `Limit must not exceed ${TASK_PAGINATION.MAX_LIMIT}`)
        .optional()
    ),
    code: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    projectId: z.string().uuid('Project ID filter must be a valid UUID.').optional(),
    milestoneId: z.string().uuid('Milestone ID filter must be a valid UUID.').optional(),
    assignedToId: z.string().uuid('Assigned To ID filter must be a valid UUID.').optional(),
    parentId: z.string().uuid('Parent ID filter must be a valid UUID.').optional(),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(TASK_SORT.ALLOWED_FIELDS).optional(),
  })
  .strict();

export type FindTasksDto = z.infer<typeof FindTasksSchema>;
