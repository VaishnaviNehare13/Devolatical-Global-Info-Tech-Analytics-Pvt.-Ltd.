import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { DocumentRepository } from './repository/document.repository';
import { DocumentService } from './service/document.service';
import { DocumentController } from './controllers/document.controller';
import { createDocumentsRouter } from './routes/document.routes';

// Import required external dependencies
import { ClientRepository } from '../clients/repository/client.repository';
import { ProjectRepository } from '../projects/repository/project.repository';
import { MilestoneRepository } from '../milestones/repository/milestone.repository';
import { AuditLogRepository } from '../audit-logs/repository/audit-log.repository';
import { AuditLogService } from '../audit-logs/service/audit-log.service';

/**
 * Bootstraps the Documents Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createDocumentsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const documentRepository = new DocumentRepository(prisma);
  const clientRepository = new ClientRepository(prisma);
  const projectRepository = new ProjectRepository(prisma);
  const milestoneRepository = new MilestoneRepository(prisma);
  const auditLogRepository = new AuditLogRepository(prisma);
  const auditLogService = new AuditLogService(auditLogRepository);

  const documentService = new DocumentService(
    documentRepository,
    clientRepository,
    projectRepository,
    milestoneRepository,
    auditLogService
  );
  const documentController = new DocumentController(documentService);

  return createDocumentsRouter(documentController, authMiddleware, authorizeAdminMiddleware);
}
