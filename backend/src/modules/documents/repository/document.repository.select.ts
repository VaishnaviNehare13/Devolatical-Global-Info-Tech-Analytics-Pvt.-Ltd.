/**
 * Centralized Prisma Select configurations for Document queries.
 */

export const DOCUMENT_BASE_SELECT = {
  id: true,
  title: true,
  fileName: true,
  fileUrl: true,
  mimeType: true,
  fileSize: true,
  clientId: true,
  projectId: true,
  milestoneId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const DOCUMENT_DETAIL_SELECT = {
  ...DOCUMENT_BASE_SELECT,
  description: true,
  createdById: true,
  updatedById: true,
  deletedAt: true,
} as const;
