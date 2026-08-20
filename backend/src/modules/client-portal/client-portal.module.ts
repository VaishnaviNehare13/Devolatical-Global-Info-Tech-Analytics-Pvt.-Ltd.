import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { ClientPortalService } from './services/client-portal.service';
import { ClientPortalController } from './controllers/client-portal.controller';
import { createClientPortalRouter } from './routes/client-portal.routes';

export function createClientPortalModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler
): Router {
  const service = new ClientPortalService(prisma);
  const controller = new ClientPortalController(service);
  return createClientPortalRouter(controller, authMiddleware);
}
