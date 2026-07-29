import { z } from 'zod';
import {
  AuditModuleSchema,
  AuditActionSchema,
  AuditStatusSchema,
  AuditSeveritySchema,
  JsonValueSchema,
} from './shared.schema';

/**
 * Zod validation schema for creating a new audit log record.
 * Restricts unknown keys and sanitizes text and connection parameters.
 */
export const CreateAuditLogSchema = z
  .object({
    userId: z
      .string({ invalid_type_error: 'User ID must be a string' })
      .uuid('Invalid user ID format. Must be a valid UUID.')
      .nullable()
      .optional(),
    requestId: z
      .string({ invalid_type_error: 'Request ID must be a string' })
      .trim()
      .nullable()
      .optional(),
    module: AuditModuleSchema,
    action: AuditActionSchema,
    entityType: z
      .string({ invalid_type_error: 'Entity type must be a string' })
      .trim()
      .nullable()
      .optional(),
    entityId: z
      .string({ invalid_type_error: 'Entity ID must be a string' })
      .trim()
      .nullable()
      .optional(),
    resourceName: z
      .string({ invalid_type_error: 'Resource name must be a string' })
      .trim()
      .nullable()
      .optional(),
    oldValues: JsonValueSchema.nullable().optional(),
    newValues: JsonValueSchema.nullable().optional(),
    metadata: JsonValueSchema.nullable().optional(),
    status: AuditStatusSchema,
    severity: AuditSeveritySchema.optional(),
    ipAddress: z
      .string({ invalid_type_error: 'IP address must be a string' })
      .ip({ message: 'Invalid IP address format. Must be a valid IPv4 or IPv6 address.' })
      .nullable()
      .optional(),
    userAgent: z
      .string({ invalid_type_error: 'User agent must be a string' })
      .trim()
      .nullable()
      .optional(),
  })
  .strict();

export type CreateAuditLogDto = z.infer<typeof CreateAuditLogSchema>;
