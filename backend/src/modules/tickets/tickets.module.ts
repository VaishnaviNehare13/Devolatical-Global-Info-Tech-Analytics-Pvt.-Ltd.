import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { TicketRepository } from './repository/ticket.repository';
import { TicketService } from './service/ticket.service';
import { TicketController } from './controllers/ticket.controller';
import { createTicketsRouter } from './routes/ticket.routes';

// Import required external dependencies
import { UserRepository } from '../users/repositories/user.repository';
import { ClientRepository } from '../clients/repository/client.repository';
import { ProjectRepository } from '../projects/repository/project.repository';
import { AuditLogRepository } from '../audit-logs/repository/audit-log.repository';
import { AuditLogService } from '../audit-logs/service/audit-log.service';

/**
 * Bootstraps the Tickets Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createTicketsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const ticketRepository = new TicketRepository(prisma);
  const userRepository = new UserRepository(prisma);
  const clientRepository = new ClientRepository(prisma);
  const projectRepository = new ProjectRepository(prisma);
  const auditLogRepository = new AuditLogRepository(prisma);
  const auditLogService = new AuditLogService(auditLogRepository);

  const ticketService = new TicketService(
    ticketRepository,
    userRepository,
    clientRepository,
    projectRepository,
    auditLogService
  );
  const ticketController = new TicketController(ticketService);

  return createTicketsRouter(ticketController, authMiddleware, authorizeAdminMiddleware);
}
