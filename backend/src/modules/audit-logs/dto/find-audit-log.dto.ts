import { z } from 'zod';
import { PaginationQuerySchema } from '../../../shared/dto/pagination-query.dto';
import { SearchQuerySchema } from '../../../shared/dto/search-query.dto';
import {
  AuditModuleSchema,
  AuditActionSchema,
  AuditStatusSchema,
  AuditSeveritySchema,
} from './shared.schema';
import { AUDIT_LOG_VALIDATION } from './audit-log.constants';

/**
 * Zod validation schema for querying audit logs.
 * Reuses shared pagination and search schemas, and strictly validates all filters, sorting parameters, and date bounds.
 */
export const FindAuditLogQuerySchema = PaginationQuerySchema.merge(SearchQuerySchema)
  .extend({
    module: AuditModuleSchema.optional(),
    action: AuditActionSchema.optional(),
    status: AuditStatusSchema.optional(),
    severity: AuditSeveritySchema.optional(),
    userId: z
      .string({ invalid_type_error: 'User ID must be a string' })
      .uuid('Invalid user ID format. Must be a valid UUID.')
      .optional(),
    requestId: z.string({ invalid_type_error: 'Request ID must be a string' }).trim().optional(),
    entityType: z.string({ invalid_type_error: 'Entity type must be a string' }).trim().optional(),
    entityId: z.string({ invalid_type_error: 'Entity ID must be a string' }).trim().optional(),
    resourceName: z
      .string({ invalid_type_error: 'Resource name must be a string' })
      .trim()
      .optional(),
    dateFrom: z
      .string({ invalid_type_error: 'dateFrom must be a string' })
      .datetime({ message: 'Invalid dateFrom format. Must be a valid ISO date string.' })
      .optional(),
    dateTo: z
      .string({ invalid_type_error: 'dateTo must be a string' })
      .datetime({ message: 'Invalid dateTo format. Must be a valid ISO date string.' })
      .optional(),
    sortField: z.enum(AUDIT_LOG_VALIDATION.ALLOWED_SORT_FIELDS).optional(),
    sortOrder: z.enum(AUDIT_LOG_VALIDATION.ALLOWED_SORT_ORDERS).optional(),
  })
  .strict();

export type FindAuditLogQueryDto = z.infer<typeof FindAuditLogQuerySchema>;
