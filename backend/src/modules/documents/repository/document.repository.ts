import { PrismaClient, Prisma } from '@prisma/client';
import { IDocumentRepository } from './document.repository.interface';
import { DOCUMENT_BASE_SELECT, DOCUMENT_DETAIL_SELECT } from './document.repository.select';
import {
  CreateDocumentRepositoryInput,
  UpdateDocumentRepositoryInput,
  DocumentBaseOutput,
  DocumentDetailOutput,
  FindDocumentsRepositoryOptions,
  DocumentFiltersInput,
  PaginatedDocumentsOutput,
  QueryOptions,
} from './document.repository.types';
import { DocumentRepositoryError } from './document.repository.errors';
import { DOCUMENT_PAGINATION, DOCUMENT_SORT } from '../constants/document.constants';

/**
 * Concrete Prisma-backed repository implementing the IDocumentRepository contract.
 * Decouples raw Prisma operations, filters logical deletes, and handles queries.
 */
export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Persists a new Document record.
   */
  public async create(data: CreateDocumentRepositoryInput): Promise<DocumentDetailOutput> {
    try {
      const result = await this.prisma.document.create({
        data: {
          title: data.title,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          description: data.description ?? null,
          clientId: data.clientId ?? null,
          projectId: data.projectId ?? null,
          milestoneId: data.milestoneId ?? null,
          createdById: data.createdById ?? null,
        },
        select: DOCUMENT_DETAIL_SELECT,
      });

      return result as unknown as DocumentDetailOutput;
    } catch (error) {
      throw new DocumentRepositoryError(
        'DATABASE_WRITE_FAILED',
        'Database write failed while creating document record.',
        error
      );
    }
  }

  /**
   * Retrieves a Document record by unique ID. Excludes soft-deleted records by default.
   */
  public async findById(id: string, options?: QueryOptions): Promise<DocumentDetailOutput | null> {
    try {
      const result = await this.prisma.document.findFirst({
        where: {
          id,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: DOCUMENT_DETAIL_SELECT,
      });

      return result as unknown as DocumentDetailOutput | null;
    } catch (error) {
      throw new DocumentRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching document by ID ${id}.`,
        error
      );
    }
  }

  /**
   * Retrieves, filters, and paginates Document records. Excludes soft-deleted records by default.
   */
  public async findMany(
    options: FindDocumentsRepositoryOptions
  ): Promise<PaginatedDocumentsOutput> {
    try {
      const page = Math.max(1, options.pagination?.page ?? DOCUMENT_PAGINATION.DEFAULT_PAGE);
      const rawLimit = options.pagination?.limit ?? DOCUMENT_PAGINATION.DEFAULT_LIMIT;
      const limit = Math.min(DOCUMENT_PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause({
        search: options.search,
        title: options.title,
        fileName: options.fileName,
        mimeType: options.mimeType,
        clientId: options.clientId,
        projectId: options.projectId,
        milestoneId: options.milestoneId,
        includeDeleted: options.includeDeleted,
      });

      const orderBy = this.buildOrderBy(options.sortField, options.sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.document.count({ where }),
        this.prisma.document.findMany({
          where,
          select: DOCUMENT_BASE_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      return {
        items: items as unknown as DocumentBaseOutput[],
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new DocumentRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while listing documents.',
        error
      );
    }
  }

  /**
   * Counts Document records matching query filter. Excludes soft-deleted records by default.
   */
  public async count(filters: DocumentFiltersInput): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await this.prisma.document.count({ where });
    } catch (error) {
      throw new DocumentRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while counting documents.',
        error
      );
    }
  }

  /**
   * Updates an existing Document record.
   */
  public async update(
    id: string,
    data: UpdateDocumentRepositoryInput
  ): Promise<DocumentDetailOutput | null> {
    try {
      const result = await this.prisma.document.update({
        where: { id },
        data: {
          title: data.title,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          description: data.description,
          clientId: data.clientId,
          projectId: data.projectId,
          milestoneId: data.milestoneId,
          updatedById: data.updatedById,
          deletedAt: data.deletedAt,
        },
        select: DOCUMENT_DETAIL_SELECT,
      });

      return result as unknown as DocumentDetailOutput;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw new DocumentRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating document with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Performs soft deletion of a Document record by setting the deletedAt timestamp.
   */
  public async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.document.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw new DocumentRepositoryError(
        'DATABASE_DELETE_FAILED',
        `Database update failed while soft-deleting document with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Restores a soft-deleted Document record by nullifying its deletedAt timestamp.
   */
  public async restore(id: string): Promise<DocumentDetailOutput> {
    try {
      const result = await this.prisma.document.update({
        where: { id },
        data: {
          deletedAt: null,
        },
        select: DOCUMENT_DETAIL_SELECT,
      });
      return result as unknown as DocumentDetailOutput;
    } catch (error) {
      throw new DocumentRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while restoring document with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Helper to build Prisma dynamic filters object.
   */
  private buildWhereClause(filters: DocumentFiltersInput): Prisma.DocumentWhereInput {
    const where: Prisma.DocumentWhereInput = {};

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.title) {
      where.title = { contains: filters.title.trim(), mode: 'insensitive' };
    }

    if (filters.fileName) {
      where.fileName = { contains: filters.fileName.trim(), mode: 'insensitive' };
    }

    if (filters.mimeType) {
      where.mimeType = filters.mimeType;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.milestoneId) {
      where.milestoneId = filters.milestoneId;
    }

    if (filters.search) {
      const searchTrim = filters.search.trim();
      where.OR = [
        { title: { contains: searchTrim, mode: 'insensitive' } },
        { fileName: { contains: searchTrim, mode: 'insensitive' } },
        { description: { contains: searchTrim, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Helper to build Prisma dynamic orderBy sort settings.
   */
  private buildOrderBy(
    sortField?: string,
    sortOrder?: 'asc' | 'desc'
  ): Prisma.DocumentOrderByWithRelationInput {
    const field = sortField || DOCUMENT_SORT.DEFAULT_FIELD;
    const order = sortOrder || DOCUMENT_SORT.DEFAULT_ORDER;
    return { [field]: order };
  }
}
