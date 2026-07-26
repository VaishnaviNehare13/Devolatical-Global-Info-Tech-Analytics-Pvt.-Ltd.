import { z } from 'zod';

/**
 * Shared Zod schema to preprocess and validate search query parameters.
 */
export const SearchQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type SearchQueryDto = z.infer<typeof SearchQuerySchema>;
