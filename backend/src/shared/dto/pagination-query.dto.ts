import { z } from 'zod';

/**
 * Shared Zod schema to preprocess and validate pagination query parameters.
 */
export const PaginationQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val ? parseInt(val as string, 10) : undefined),
    z.number().int().positive('Page must be a positive integer').optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(val as string, 10) : undefined),
    z.number().int().positive('Limit must be a positive integer').optional()
  ),
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;
