export interface CreateDocumentRepositoryInput {
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  description?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  milestoneId?: string | null;
  createdById?: string | null;
}

export interface UpdateDocumentRepositoryInput {
  title?: string;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  fileSize?: number;
  description?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  milestoneId?: string | null;
  updatedById?: string | null;
  deletedAt?: Date | null;
}

export interface DocumentBaseOutput {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  clientId: string | null;
  projectId: string | null;
  milestoneId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentDetailOutput extends DocumentBaseOutput {
  description: string | null;
  createdById: string | null;
  updatedById: string | null;
  deletedAt: Date | null;
}

export interface FindDocumentsRepositoryOptions {
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

export interface DocumentFiltersInput {
  search?: string;
  title?: string;
  fileName?: string;
  mimeType?: string;
  clientId?: string;
  projectId?: string;
  milestoneId?: string;
  includeDeleted?: boolean;
}

export interface PaginatedDocumentsOutput {
  items: DocumentBaseOutput[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryOptions {
  includeDeleted?: boolean;
}
