import type { BaseQueryParams } from './api';

export interface DocumentSummary {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  clientId: string | null;
  projectId: string | null;
  milestoneId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DocumentDetail extends DocumentSummary {
  description: string | null;
}

export interface UploadDocumentPayload {
  file: File | Blob;
  title: string;
  description?: string;
  clientId?: string;
  projectId?: string;
  milestoneId?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  clientId?: string | null;
  projectId?: string | null;
  milestoneId?: string | null;
}

export interface FindDocumentsQuery extends BaseQueryParams {
  mimeType?: string;
  clientId?: string;
  projectId?: string;
  milestoneId?: string;
  includeDeleted?: boolean;
}
