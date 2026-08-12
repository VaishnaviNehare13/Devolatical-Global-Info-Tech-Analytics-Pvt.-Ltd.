import { z } from 'zod';
import { DOCUMENT_VALIDATION, ALLOWED_MIME_TYPES } from '../constants/document.constants';

export const DocumentTitleSchema = z
  .string({ required_error: 'Document title is required.' })
  .trim()
  .min(
    DOCUMENT_VALIDATION.TITLE_MIN_LENGTH,
    `Document title must be at least ${DOCUMENT_VALIDATION.TITLE_MIN_LENGTH} characters.`
  )
  .max(
    DOCUMENT_VALIDATION.TITLE_MAX_LENGTH,
    `Document title must not exceed ${DOCUMENT_VALIDATION.TITLE_MAX_LENGTH} characters.`
  );

export const DocumentDescriptionSchema = z
  .string()
  .trim()
  .max(
    DOCUMENT_VALIDATION.DESCRIPTION_MAX_LENGTH,
    `Document description must not exceed ${DOCUMENT_VALIDATION.DESCRIPTION_MAX_LENGTH} characters.`
  )
  .nullable();

export const DocumentFileNameSchema = z
  .string({ required_error: 'File name is required.' })
  .trim()
  .min(1, 'File name cannot be empty.')
  .max(
    DOCUMENT_VALIDATION.FILE_NAME_MAX_LENGTH,
    `File name must not exceed ${DOCUMENT_VALIDATION.FILE_NAME_MAX_LENGTH} characters.`
  );

export const DocumentFileUrlSchema = z
  .string({ required_error: 'File URL is required.' })
  .trim()
  .min(1, 'File URL cannot be empty.');

export const DocumentMimeTypeSchema = z
  .string({ required_error: 'MIME type is required.' })
  .trim()
  .refine(
    (val) => (ALLOWED_MIME_TYPES as readonly string[]).includes(val),
    'Unsupported or invalid file MIME type.'
  );

export const DocumentFileSizeSchema = z.preprocess(
  (val) => (val === null || val === undefined || val === '' ? null : Number(val)),
  z
    .number({ required_error: 'File size is required.' })
    .int('File size must be an integer.')
    .positive('File size must be greater than zero.')
    .max(
      DOCUMENT_VALIDATION.MAX_FILE_SIZE,
      `File size must not exceed ${DOCUMENT_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)} MB.`
    )
);

export const DocumentClientIdSchema = z.string().uuid('Client ID must be a valid UUID.').nullable();

export const DocumentProjectIdSchema = z
  .string()
  .uuid('Project ID must be a valid UUID.')
  .nullable();

export const DocumentMilestoneIdSchema = z
  .string()
  .uuid('Milestone ID must be a valid UUID.')
  .nullable();

export const DocumentIdParamSchema = z
  .object({
    id: z
      .string({ required_error: 'ID parameter is required.' })
      .uuid('Invalid ID format. Must be a valid UUID.'),
  })
  .strict();
