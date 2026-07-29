import { Router, RequestHandler } from 'express';
import { AuditLogController } from '../controller/audit-log.controller';
import { FindAuditLogQuerySchema } from '../dto/find-audit-log.dto';
import { AuditLogParamSchema } from '../dto/audit-log-param.dto';
import { validate } from '../../../middleware';

/**
 * Configures and returns the Express Router for the Audit Logs module.
 * Registers read-only endpoints, applies parameter validation, and mounts security filters.
 *
 * @param auditLogController Controller delegate handling endpoints
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createAuditLogsRouter(
  auditLogController: AuditLogController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Enforce authentication across all audit log routes
  router.use(authMiddleware);

  // Administrative read-only audit log queries
  router.get(
    '/',
    authorizeAdminMiddleware,
    validate({ query: FindAuditLogQuerySchema }),
    auditLogController.getAuditLogs
  );

  router.get(
    '/:id',
    authorizeAdminMiddleware,
    validate({ params: AuditLogParamSchema }),
    auditLogController.getAuditLogById
  );

  return router;
}
