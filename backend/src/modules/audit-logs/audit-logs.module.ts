import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuditLogRepository } from './repository/audit-log.repository';
import { AuditLogService } from './service/audit-log.service';
import { AuditLogController } from './controller/audit-log.controller';
import { createAuditLogsRouter } from './routes/audit-log.routes';

/**
 * Bootstraps the Audit Logs Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createAuditLogsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const repository = new AuditLogRepository(prisma);
  const service = new AuditLogService(repository);
  const controller = new AuditLogController(service);

  return createAuditLogsRouter(controller, authMiddleware, authorizeAdminMiddleware);
}
