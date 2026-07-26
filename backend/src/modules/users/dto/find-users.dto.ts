import { z } from 'zod';
import { UserStatus } from '../types/user.types';

/**
 * Zod validation schema for user search, filter, and pagination query parameters.
 * Rejects unknown query keys and parses numeric parameters safely.
 */
export const FindUsersSchema = z
  .object({
    page: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z.number().int().positive('Page must be a positive integer').optional()
    ),
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z.number().int().positive('Limit must be a positive integer').optional()
    ),
    search: z.string().trim().optional(),
    status: z.nativeEnum(UserStatus).optional(),
    roleId: z.string().uuid('Invalid role ID format').optional(),
    includeDeleted: z.preprocess((val) => val === 'true', z.boolean().optional()),
    sortField: z.enum(['createdAt', 'displayName', 'email'] as const).optional(),
    sortOrder: z.enum(['asc', 'desc'] as const).optional(),
  })
  .strict();

export type FindUsersDto = z.infer<typeof FindUsersSchema>;
