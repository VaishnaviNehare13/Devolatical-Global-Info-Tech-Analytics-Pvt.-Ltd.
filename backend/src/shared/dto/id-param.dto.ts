import { z } from 'zod';

/**
 * Shared Zod schema to validate UUID parameter inputs.
 */
export const IdParamSchema = z
  .object({
    id: z
      .string({ required_error: 'ID parameter is required.' })
      .uuid('Invalid ID format. Must be a valid UUID.'),
  })
  .strict();

export type IdParamDto = z.infer<typeof IdParamSchema>;
