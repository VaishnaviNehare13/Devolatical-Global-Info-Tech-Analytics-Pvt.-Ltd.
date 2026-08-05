import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { ClientRepository } from './repository/client.repository';
import { ClientService } from './service/client.service';
import { ClientController } from './controllers/client.controller';
import { createClientsRouter } from './routes/client.routes';

// Import required external dependencies
import { UserRepository } from '../users/repositories/user.repository';
import { AuditLogRepository } from '../audit-logs/repository/audit-log.repository';
import { AuditLogService } from '../audit-logs/service/audit-log.service';

/**
 * Bootstraps the Clients Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createClientsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const clientRepository = new ClientRepository(prisma);
  const userRepository = new UserRepository(prisma);
  const auditLogRepository = new AuditLogRepository(prisma);
  const auditLogService = new AuditLogService(auditLogRepository);

  const clientService = new ClientService(
    clientRepository,
    userRepository,
    auditLogService
  );
  const clientController = new ClientController(clientService);

  return createClientsRouter(clientController, authMiddleware, authorizeAdminMiddleware);
}
