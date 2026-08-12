import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionService } from './services/permission.service';
import { PermissionController } from './controllers/permission.controller';
import { createPermissionsRouter } from './routes/permission.routes';

/**
 * Bootstraps the Permissions Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createPermissionsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const permissionRepository = new PermissionRepository(prisma);
  const permissionService = new PermissionService(permissionRepository);
  const permissionController = new PermissionController(permissionService);

  return createPermissionsRouter(permissionController, authMiddleware, authorizeAdminMiddleware);
}
