import {
  DocumentBaseOutput,
  DocumentDetailOutput,
  PaginatedDocumentsOutput,
} from '../repository/document.repository.types';

export interface DocumentSummaryResponse {
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
}

export interface DocumentDetailResponse extends DocumentSummaryResponse {
  description: string | null;
}

export interface PaginatedDocumentsResponse {
  items: DocumentSummaryResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Pure Mapper responsible for transforming Documents service outputs into API response structures.
 * Contains no business logic, database queries, or framework-specific objects.
 */
export class DocumentMapper {
  /**
   * Transforms a base document summary output into a presentation-safe response model.
   */
  public static toSummaryResponse(document: DocumentBaseOutput): DocumentSummaryResponse {
    return {
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      clientId: document.clientId,
      projectId: document.projectId,
      milestoneId: document.milestoneId,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };
  }

  /**
   * Transforms a detailed document output into a presentation-safe response model.
   * Excludes internal database properties (like deletedAt, createdById, updatedById).
   */
  public static toDetailResponse(document: DocumentDetailOutput): DocumentDetailResponse {
    return {
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      clientId: document.clientId,
      projectId: document.projectId,
      milestoneId: document.milestoneId,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      description: document.description,
    };
  }

  /**
   * Transforms a paginated document list output into a presentation-safe response model.
   */
  public static toPaginatedResponse(
    paginated: PaginatedDocumentsOutput
  ): PaginatedDocumentsResponse {
    return {
      items: paginated.items.map((item) => this.toSummaryResponse(item)),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
    };
  }
}
