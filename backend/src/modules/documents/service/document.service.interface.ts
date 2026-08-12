import {
  DocumentDetailOutput,
  PaginatedDocumentsOutput,
  DocumentFiltersInput,
} from '../repository/document.repository.types';
import {
  CreateDocumentServiceInput,
  UpdateDocumentServiceInput,
  FindDocumentsServiceOptions,
} from './document.service.types';

/**
 * Service Contract for managing Document business logic.
 * Encapsulates validations, audit tracking, and repository boundaries.
 */
export interface IDocumentService {
  createDocument(
    data: CreateDocumentServiceInput,
    currentUserId: string
  ): Promise<DocumentDetailOutput>;
  getDocumentById(id: string): Promise<DocumentDetailOutput>;
  listDocuments(options: FindDocumentsServiceOptions): Promise<PaginatedDocumentsOutput>;
  updateDocument(
    id: string,
    data: UpdateDocumentServiceInput,
    currentUserId: string
  ): Promise<DocumentDetailOutput>;
  archiveDocument(id: string, currentUserId: string): Promise<DocumentDetailOutput>;
  restoreDocument(id: string, currentUserId: string): Promise<DocumentDetailOutput>;
  countDocuments(filters: DocumentFiltersInput): Promise<number>;
}
