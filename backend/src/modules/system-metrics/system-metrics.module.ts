import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { SystemMetricsService } from './system-metrics.service';
import { SystemMetricsController } from './system-metrics.controller';
import { createSystemMetricsRouter } from './system-metrics.routes';

export function createSystemMetricsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const service = new SystemMetricsService(prisma);
  const controller = new SystemMetricsController(service);
  return createSystemMetricsRouter(controller, authMiddleware, authorizeAdminMiddleware);
}
