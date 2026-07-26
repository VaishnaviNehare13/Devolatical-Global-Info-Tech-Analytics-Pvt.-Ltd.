import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { RoleRepository } from './repositories/role.repository';
import { RoleService } from './services/role.service';
import { RoleController } from './controllers/role.controller';
import { createRolesRouter } from './routes/role.routes';

/**
 * Bootstraps the Roles Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createRolesModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const roleRepository = new RoleRepository(prisma);
  const roleService = new RoleService(roleRepository);
  const roleController = new RoleController(roleService);

  return createRolesRouter(roleController, authMiddleware, authorizeAdminMiddleware);
}
