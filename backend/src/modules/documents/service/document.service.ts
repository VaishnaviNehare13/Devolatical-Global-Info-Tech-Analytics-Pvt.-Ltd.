import { AuditAction, AuditModule, AuditStatus, AuditSeverity } from '@prisma/client';
import { IDocumentRepository } from '../repository/document.repository.interface';
import { IClientRepository } from '../../clients/repository/client.repository.interface';
import { IProjectRepository } from '../../projects/repository/project.repository.interface';
import { IMilestoneRepository } from '../../milestones/repository/milestone.repository.interface';
import { IAuditLogService } from '../../audit-logs/service/audit-log.service';
import {
  DocumentDetailOutput,
  PaginatedDocumentsOutput,
  DocumentFiltersInput,
} from '../repository/document.repository.types';
import { IDocumentService } from './document.service.interface';
import {
  CreateDocumentServiceInput,
  UpdateDocumentServiceInput,
  FindDocumentsServiceOptions,
} from './document.service.types';
import {
  DocumentServiceError,
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
} from './document.service.errors';

/**
 * Concrete implementation of Documents Business Service.
 * Coordinates persistence via IDocumentRepository, validates linked Client, Project,
 * and Milestone entities, and logs audit entries.
 */
export class DocumentService implements IDocumentService {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly clientRepository: IClientRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly milestoneRepository: IMilestoneRepository,
    private readonly auditLogService: IAuditLogService
  ) {}

  /**
   * Persists a new Document record after validating referenced entities.
   */
  public async createDocument(
    data: CreateDocumentServiceInput,
    currentUserId: string
  ): Promise<DocumentDetailOutput> {
    try {
      // 1. Validate referenced client if provided
      if (data.clientId) {
        await this.validateClient(data.clientId);
      }

      // 2. Validate referenced project if provided
      if (data.projectId) {
        await this.validateProject(data.projectId);
      }

      // 3. Validate referenced milestone if provided
      if (data.milestoneId) {
        await this.validateMilestone(data.milestoneId, data.projectId);
      }

      // 4. Persist document
      const result = await this.documentRepository.create({
        ...data,
        createdById: currentUserId,
      });

      // 5. Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.CREATE,
          module: AuditModule.DOCUMENTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Document',
          entityId: result.id,
          resourceName: result.title,
          newValues: {
            title: result.title,
            fileName: result.fileName,
            fileUrl: result.fileUrl,
            mimeType: result.mimeType,
            fileSize: result.fileSize,
            clientId: result.clientId,
            projectId: result.projectId,
            milestoneId: result.milestoneId,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for document creation:', auditError);
      }

      return result;
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(`Failed to create document: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves an active Document record by ID.
   */
  public async getDocumentById(id: string): Promise<DocumentDetailOutput> {
    try {
      const document = await this.documentRepository.findById(id);
      if (!document) {
        throw new DocumentNotFoundError(id);
      }
      return document;
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(
        `Failed to retrieve document ${id}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Lists, filters, and paginates Document records.
   */
  public async listDocuments(
    options: FindDocumentsServiceOptions
  ): Promise<PaginatedDocumentsOutput> {
    try {
      return await this.documentRepository.findMany(options);
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(`Failed to list documents: ${(error as Error).message}`);
    }
  }

  /**
   * Updates an existing active Document record.
   */
  public async updateDocument(
    id: string,
    data: UpdateDocumentServiceInput,
    currentUserId: string
  ): Promise<DocumentDetailOutput> {
    try {
      // 1. Ensure document exists and is active
      const existing = await this.documentRepository.findById(id, { includeDeleted: true });
      if (!existing) {
        throw new DocumentNotFoundError(id);
      }
      if (existing.deletedAt !== null) {
        throw new DocumentArchivedError(id);
      }

      // 2. Validate client if changed
      if (data.clientId !== undefined && data.clientId !== null) {
        await this.validateClient(data.clientId);
      }

      // 3. Determine effective project ID for milestone alignment
      const effectiveProjectId = data.projectId !== undefined ? data.projectId : existing.projectId;

      if (data.projectId !== undefined && data.projectId !== null) {
        await this.validateProject(data.projectId);
      }

      // 4. Validate milestone if changed or project changed
      if (data.milestoneId !== undefined && data.milestoneId !== null) {
        await this.validateMilestone(data.milestoneId, effectiveProjectId);
      } else if (data.projectId !== undefined && existing.milestoneId) {
        // If project changed and milestone wasn't explicitly changed, verify existing milestone against new project
        await this.validateMilestone(existing.milestoneId, effectiveProjectId);
      }

      // 5. Update record
      const updated = await this.documentRepository.update(id, {
        ...data,
        updatedById: currentUserId,
      });

      if (!updated) {
        throw new DocumentNotFoundError(id);
      }

      // 6. Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.DOCUMENTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Document',
          entityId: id,
          resourceName: updated.title,
          oldValues: {
            title: existing.title,
            description: existing.description,
            clientId: existing.clientId,
            projectId: existing.projectId,
            milestoneId: existing.milestoneId,
          },
          newValues: {
            title: updated.title,
            description: updated.description,
            clientId: updated.clientId,
            projectId: updated.projectId,
            milestoneId: updated.milestoneId,
          },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for document update:', auditError);
      }

      return updated;
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(
        `Failed to update document ${id}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Soft-deletes (archives) a Document record.
   */
  public async archiveDocument(id: string, currentUserId: string): Promise<DocumentDetailOutput> {
    try {
      const document = await this.documentRepository.findById(id, { includeDeleted: true });
      if (!document) {
        throw new DocumentNotFoundError(id);
      }

      if (document.deletedAt !== null) {
        throw new InvalidDocumentStatusTransitionError(`Document ${id} is already archived.`);
      }

      const deleted = await this.documentRepository.softDelete(id);
      if (!deleted) {
        throw new DocumentNotFoundError(id);
      }

      const updated = await this.documentRepository.findById(id, { includeDeleted: true });
      if (!updated) {
        throw new DocumentNotFoundError(id);
      }

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.DELETE,
          module: AuditModule.DOCUMENTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Document',
          entityId: id,
          resourceName: document.title,
        });
      } catch (auditError) {
        console.error('Failed to create audit log for document archiving:', auditError);
      }

      return updated;
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(
        `Failed to archive document ${id}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Restores an archived Document record back to active status.
   */
  public async restoreDocument(id: string, currentUserId: string): Promise<DocumentDetailOutput> {
    try {
      const document = await this.documentRepository.findById(id, { includeDeleted: true });
      if (!document) {
        throw new DocumentNotFoundError(id);
      }

      if (document.deletedAt === null) {
        throw new InvalidDocumentStatusTransitionError(
          `Document ${id} is active and cannot be restored.`
        );
      }

      const restored = await this.documentRepository.restore(id);

      // Log side-effect auditing
      try {
        await this.auditLogService.record({
          action: AuditAction.UPDATE,
          module: AuditModule.DOCUMENTS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          userId: currentUserId,
          entityType: 'Document',
          entityId: id,
          resourceName: restored.title,
          metadata: { action: 'RESTORE' },
        });
      } catch (auditError) {
        console.error('Failed to create audit log for document restoration:', auditError);
      }

      return restored;
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(
        `Failed to restore document ${id}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Counts Document records matching filter options.
   */
  public async countDocuments(filters: DocumentFiltersInput): Promise<number> {
    try {
      return await this.documentRepository.count(filters);
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(`Failed to count documents: ${(error as Error).message}`);
    }
  }

  /**
   * Helper: Validates that referenced client exists and is active.
   */
  private async validateClient(clientId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError(clientId);
    }
    if (client.deletedAt !== null || client.status === 'ARCHIVED') {
      throw new ClientArchivedError(clientId);
    }
  }

  /**
   * Helper: Validates that referenced project exists and is active.
   */
  private async validateProject(projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }
    if (project.deletedAt !== null || project.status === 'ARCHIVED') {
      throw new ProjectArchivedError(projectId);
    }
  }

  /**
   * Helper: Validates that referenced milestone exists, is active, and matches project if provided.
   */
  private async validateMilestone(
    milestoneId: string,
    expectedProjectId?: string | null
  ): Promise<void> {
    const milestone = await this.milestoneRepository.findById(milestoneId);
    if (!milestone) {
      throw new MilestoneNotFoundError(milestoneId);
    }
    if (milestone.deletedAt !== null) {
      throw new MilestoneArchivedError(milestoneId);
    }
    if (expectedProjectId && milestone.projectId !== expectedProjectId) {
      throw new InvalidDocumentEntityRelationError(
        `Milestone '${milestoneId}' does not belong to project '${expectedProjectId}'.`
      );
    }
  }
}
