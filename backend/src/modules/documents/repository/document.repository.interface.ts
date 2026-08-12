import {
  CreateDocumentRepositoryInput,
  UpdateDocumentRepositoryInput,
  DocumentDetailOutput,
  FindDocumentsRepositoryOptions,
  DocumentFiltersInput,
  PaginatedDocumentsOutput,
  QueryOptions,
} from './document.repository.types';

export interface IDocumentRepository {
  create(data: CreateDocumentRepositoryInput): Promise<DocumentDetailOutput>;
  findById(id: string, options?: QueryOptions): Promise<DocumentDetailOutput | null>;
  findMany(options: FindDocumentsRepositoryOptions): Promise<PaginatedDocumentsOutput>;
  count(filters: DocumentFiltersInput): Promise<number>;
  update(id: string, data: UpdateDocumentRepositoryInput): Promise<DocumentDetailOutput | null>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<DocumentDetailOutput>;
}
