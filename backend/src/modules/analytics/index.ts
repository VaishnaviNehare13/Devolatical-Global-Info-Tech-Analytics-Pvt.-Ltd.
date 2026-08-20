import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { createAnalyticsRouter } from './routes/analytics.routes';

export { AnalyticsRepository, AnalyticsService, AnalyticsController };

export function createAnalyticsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeMiddleware: RequestHandler
): Router {
  const repository = new AnalyticsRepository(prisma);
  const service = new AnalyticsService(repository);
  const controller = new AnalyticsController(service, prisma);
  return createAnalyticsRouter(controller, authMiddleware, authorizeMiddleware);
}
