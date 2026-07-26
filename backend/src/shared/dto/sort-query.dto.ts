import { z } from 'zod';

/**
 * Shared Zod schema to validate sort order parameters.
 */
export const SortQuerySchema = z.object({
  sortOrder: z.enum(['asc', 'desc'] as const).optional(),
});

export type SortQueryDto = z.infer<typeof SortQuerySchema>;
