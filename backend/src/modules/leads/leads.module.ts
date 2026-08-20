import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { LeadRepository } from './repository/lead.repository';
import { LeadService } from './service/lead.service';
import { LeadController } from './controllers/lead.controller';
import { createLeadsRouter } from './routes/lead.routes';

// Import required external dependencies
import { UserRepository } from '../users/repositories/user.repository';
import { AuditLogRepository } from '../audit-logs/repository/audit-log.repository';
import { AuditLogService } from '../audit-logs/service/audit-log.service';

/**
 * Bootstraps the Leads Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createLeadsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const leadRepository = new LeadRepository(prisma);
  const userRepository = new UserRepository(prisma);
  const auditLogRepository = new AuditLogRepository(prisma);
  const auditLogService = new AuditLogService(auditLogRepository);

  const leadService = new LeadService(leadRepository, userRepository, auditLogService, prisma);
  const leadController = new LeadController(leadService);

  return createLeadsRouter(leadController, authMiddleware, authorizeAdminMiddleware);
}
