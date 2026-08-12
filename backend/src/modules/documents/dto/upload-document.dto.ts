import { z } from 'zod';
import {
  DocumentTitleSchema,
  DocumentDescriptionSchema,
  DocumentClientIdSchema,
  DocumentProjectIdSchema,
  DocumentMilestoneIdSchema,
} from './shared.schema';

/**
 * Zod validation schema for uploading a new Document (metadata payload).
 */
export const UploadDocumentSchema = z
  .object({
    title: DocumentTitleSchema,
    description: DocumentDescriptionSchema.optional(),
    clientId: DocumentClientIdSchema.optional(),
    projectId: DocumentProjectIdSchema.optional(),
    milestoneId: DocumentMilestoneIdSchema.optional(),
  })
  .strict();

export type UploadDocumentDto = z.infer<typeof UploadDocumentSchema>;
