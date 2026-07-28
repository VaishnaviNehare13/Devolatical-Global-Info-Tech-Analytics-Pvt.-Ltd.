import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { PermissionRepository } from '../permissions/repositories/permission.repository';
import { RolePermissionService } from './services/role-permission.service';
import { RolePermissionController } from './controllers/role-permission.controller';
import { createRolePermissionsRouter } from './routes/role-permission.routes';

/**
 * Bootstraps the Role-Permission Mapping Module. Instantiates repositories, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createRolePermissionsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  // 1. Instantiate Repositories
  const rolePermissionRepository = new RolePermissionRepository(prisma);
  const roleRepository = new RoleRepository(prisma);
  const permissionRepository = new PermissionRepository(prisma);

  // 2. Instantiate Service
  const rolePermissionService = new RolePermissionService(
    rolePermissionRepository,
    roleRepository,
    permissionRepository
  );

  // 3. Instantiate Controller
  const rolePermissionController = new RolePermissionController(rolePermissionService);

  // 4. Create and configure Router
  return createRolePermissionsRouter(
    rolePermissionController,
    authMiddleware,
    authorizeAdminMiddleware
  );
}
