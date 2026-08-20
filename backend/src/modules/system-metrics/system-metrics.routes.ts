import { Router, RequestHandler } from 'express';
import { SystemMetricsController } from './system-metrics.controller';

export function createSystemMetricsRouter(
  controller: SystemMetricsController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Enforce authentication and administrative RBAC for system metrics
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // GET /api/v1/system/metrics
  router.get('/metrics', controller.getSystemMetrics);

  return router;
}
