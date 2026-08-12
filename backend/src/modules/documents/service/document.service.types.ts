export interface CreateDocumentServiceInput {
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  description?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  milestoneId?: string | null;
}

export interface UpdateDocumentServiceInput {
  title?: string;
  description?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  milestoneId?: string | null;
}

export interface FindDocumentsServiceOptions {
  pagination?: {
    page: number;
    limit: number;
  };
  search?: string;
  title?: string;
  fileName?: string;
  mimeType?: string;
  clientId?: string;
  projectId?: string;
  milestoneId?: string;
  includeDeleted?: boolean;
  sortField?: 'title' | 'fileName' | 'mimeType' | 'fileSize' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
