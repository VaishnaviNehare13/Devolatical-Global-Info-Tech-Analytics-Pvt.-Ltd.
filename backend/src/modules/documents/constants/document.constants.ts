/**
 * Reusable constants for document pagination settings.
 */
export const DOCUMENT_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Reusable constants for document list sorting rules.
 */
export const DOCUMENT_SORT = {
  ALLOWED_FIELDS: ['title', 'fileName', 'mimeType', 'fileSize', 'createdAt', 'updatedAt'] as const,
  DEFAULT_FIELD: 'createdAt',
  DEFAULT_ORDER: 'desc',
} as const;

export type AllowedDocumentSortField = (typeof DOCUMENT_SORT.ALLOWED_FIELDS)[number];

/**
 * Centralized limits for document field validation.
 */
export const DOCUMENT_VALIDATION = {
  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 150,
  FILE_NAME_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25 MB
} as const;

/**
 * Allowed MIME types for uploaded documents.
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/zip',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
