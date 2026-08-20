import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { IDocumentService } from '../service/document.service.interface';
import { DocumentMapper } from '../mappers/document.mapper';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { FindDocumentsDto } from '../dto/find-documents.dto';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  DocumentNotFoundError,
  DocumentArchivedError,
  InvalidDocumentStatusTransitionError,
  ClientNotFoundError,
  ClientArchivedError,
  ProjectNotFoundError,
  ProjectArchivedError,
  MilestoneNotFoundError,
  MilestoneArchivedError,
  InvalidDocumentEntityRelationError,
} from '../service/document.service.errors';

/**
 * Express Controller responsible for delegating document-specific HTTP endpoints
 * to the IDocumentService business layer.
 * Decoupled from service implementation details via interface constructor injection.
 */
export class DocumentController {
  constructor(private readonly documentService: IDocumentService) {}

  /**
   * Handles document upload and metadata persistence.
   */
  public uploadDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('File is required for document upload.', HttpStatus.BAD_REQUEST);
      }

      const dto: UploadDocumentDto = req.body;
      const userId = req.user!.id;

      const result = await this.documentService.createDocument(
        {
          title: dto.title,
          fileName: req.file.originalname,
          fileUrl: req.file.path.replace(/\\/g, '/'),
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          description: dto.description,
          clientId: dto.clientId,
          projectId: dto.projectId,
          milestoneId: dto.milestoneId,
        },
        userId
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Document uploaded successfully.',
        data: DocumentMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a document by unique ID.
   */
  public getDocumentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.documentService.getDocumentById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Document details retrieved successfully.',
        data: DocumentMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Downloads the physical document file securely.
   */
  public downloadDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.documentService.getDocumentById(id);

      const absolutePath = path.isAbsolute(result.fileUrl)
        ? result.fileUrl
        : path.resolve(process.cwd(), result.fileUrl);

      if (!fs.existsSync(absolutePath)) {
        throw new AppError('Physical document file not found on server disk.', HttpStatus.NOT_FOUND);
      }

      res.setHeader('Content-Type', result.mimeType);
      res.download(absolutePath, result.fileName, (err) => {
        if (err && !res.headersSent) {
          next(err);
        }
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a paginated list of documents matching query criteria.
   */
  public listDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindDocumentsDto;
      const result = await this.documentService.listDocuments({
        pagination:
          query.page && query.limit
            ? {
                page: query.page,
                limit: query.limit,
              }
            : undefined,
        search: query.search,
        title: query.title,
        fileName: query.fileName,
        mimeType: query.mimeType,
        clientId: query.clientId,
        projectId: query.projectId,
        milestoneId: query.milestoneId,
        includeDeleted: query.includeDeleted,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Documents list retrieved successfully.',
        data: DocumentMapper.toPaginatedResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates an existing active document's metadata.
   */
  public updateDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateDocumentDto = req.body;
      const userId = req.user!.id;
      const result = await this.documentService.updateDocument(id, dto, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Document updated successfully.',
        data: DocumentMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft-deletes (archives) a document. Returns NO_CONTENT.
   */
  public archiveDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      await this.documentService.archiveDocument(id, userId);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Restores an archived document back to active status.
   */
  public restoreDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const result = await this.documentService.restoreDocument(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Document restored successfully.',
        data: DocumentMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof DocumentNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (
      error instanceof DocumentArchivedError ||
      error instanceof InvalidDocumentStatusTransitionError ||
      error instanceof ClientNotFoundError ||
      error instanceof ClientArchivedError ||
      error instanceof ProjectNotFoundError ||
      error instanceof ProjectArchivedError ||
      error instanceof MilestoneNotFoundError ||
      error instanceof MilestoneArchivedError ||
      error instanceof InvalidDocumentEntityRelationError
    ) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else {
      next(error);
    }
  }
}
