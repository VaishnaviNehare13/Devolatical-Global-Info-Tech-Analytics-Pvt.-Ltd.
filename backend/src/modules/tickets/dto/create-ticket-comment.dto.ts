import { z } from 'zod';

export const CreateTicketCommentSchema = z
  .object({
    message: z
      .string({ required_error: 'Comment message is required.' })
      .trim()
      .min(1, 'Comment message cannot be empty.')
      .max(2000, 'Comment message must not exceed 2000 characters.'),
    isInternal: z.boolean().optional().default(false),
  })
  .strict();

export type CreateTicketCommentDto = z.infer<typeof CreateTicketCommentSchema>;
