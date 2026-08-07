import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProjectRepository } from './repository/project.repository';
import { ClientRepository } from '../clients/repository/client.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { AuditLogRepository } from '../audit-logs/repository/audit-log.repository';
import { AuditLogService } from '../audit-logs/service/audit-log.service';
import { ProjectService } from './service/project.service';
import { ProjectController } from './controllers/project.controller';
import { createProjectsRouter } from './routes/project.routes';

/**
 * Bootstraps the Projects Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createProjectsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const projectRepository = new ProjectRepository(prisma);
  const clientRepository = new ClientRepository(prisma);
  const userRepository = new UserRepository(prisma);
  const auditLogRepository = new AuditLogRepository(prisma);
  const auditLogService = new AuditLogService(auditLogRepository);

  const projectService = new ProjectService(
    projectRepository,
    clientRepository,
    userRepository,
    auditLogService
  );
  const projectController = new ProjectController(projectService);

  return createProjectsRouter(projectController, authMiddleware, authorizeAdminMiddleware);
}
