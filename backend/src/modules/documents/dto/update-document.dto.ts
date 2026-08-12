import { z } from 'zod';
import {
  DocumentTitleSchema,
  DocumentDescriptionSchema,
  DocumentClientIdSchema,
  DocumentProjectIdSchema,
  DocumentMilestoneIdSchema,
} from './shared.schema';

/**
 * Zod validation schema for updating an existing Document's metadata.
 * Uses strict mode and requires at least one field to be present.
 */
export const UpdateDocumentSchema = z
  .object({
    title: DocumentTitleSchema.optional(),
    description: DocumentDescriptionSchema.optional(),
    clientId: DocumentClientIdSchema.optional(),
    projectId: DocumentProjectIdSchema.optional(),
    milestoneId: DocumentMilestoneIdSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdateDocumentDto = z.infer<typeof UpdateDocumentSchema>;
