import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { MilestoneRepository } from './repository/milestone.repository';
import { ProjectRepository } from '../projects/repository/project.repository';
import { AuditLogRepository } from '../audit-logs/repository/audit-log.repository';
import { AuditLogService } from '../audit-logs/service/audit-log.service';
import { MilestoneService } from './service/milestone.service';
import { MilestoneController } from './controllers/milestone.controller';
import { createMilestonesRouter } from './routes/milestone.routes';

/**
 * Bootstraps the Milestones Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createMilestonesModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const milestoneRepository = new MilestoneRepository(prisma);
  const projectRepository = new ProjectRepository(prisma);
  const auditLogRepository = new AuditLogRepository(prisma);
  const auditLogService = new AuditLogService(auditLogRepository);

  const milestoneService = new MilestoneService(
    milestoneRepository,
    projectRepository,
    auditLogService
  );
  const milestoneController = new MilestoneController(milestoneService);

  return createMilestonesRouter(milestoneController, authMiddleware, authorizeAdminMiddleware);
}
