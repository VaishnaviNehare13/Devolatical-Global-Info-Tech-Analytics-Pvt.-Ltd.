import { Router } from 'express';
import healthRouter from './health.routes';

// Users imports
import { UserRepository } from '../../modules/users/repositories/user.repository';
import { UserService } from '../../modules/users/services/user.service';
import { UserController } from '../../modules/users/controllers/user.controller';
import { createUsersRouter } from '../../modules/users/routes/user.routes';

// Auth imports
import { AuthRepository } from '../../modules/auth/repositories/auth.repository';
import { AuthService } from '../../modules/auth/services/auth.service';
import { AuthController } from '../../modules/auth/controllers/auth.controller';
import { createAuthRouter } from '../../modules/auth/routes/auth.routes';

// Roles imports
import { createRolesModule } from '../../modules/roles/roles.module';
import { createRolePermissionsModule } from '../../modules/role-permissions/role-permissions.module';

// Audit Logs imports
import { createAuditLogsModule } from '../../modules/audit-logs';

// Shared imports
import { SYSTEM_ROLES } from '../../shared/constants/roles';

// Middleware imports
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorization.middleware';
import { prisma } from '../../config/db';

const v1Router = Router();

// Mount Health routes (which defines GET /health)
v1Router.use(healthRouter);

// Initialize Shared Repositories and Middlewares
const authRepository = new AuthRepository();
const authMiddleware = new AuthMiddleware(authRepository);
const authorizeAdmin = authorize({
  roles: [SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.ADMIN], // Authorization roles using centralized constants
});

// Initialize and Mount Auth Router
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);
const authRouter = createAuthRouter(authController, authMiddleware.handle);
v1Router.use('/auth', authRouter);

// Initialize and Mount Users Router
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);
const usersRouter = createUsersRouter(userController, authMiddleware.handle, authorizeAdmin);
v1Router.use('/users', usersRouter);

// Initialize and Mount Roles Router
v1Router.use('/roles', createRolesModule(prisma, authMiddleware.handle, authorizeAdmin));
v1Router.use('/roles', createRolePermissionsModule(prisma, authMiddleware.handle, authorizeAdmin));

// Initialize and Mount Audit Logs Router
const auditLogsRouter = createAuditLogsModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/audit-logs', auditLogsRouter);

/**
 * Placeholder mounts for future module routing:
 *
 * - Portal Clients: v1Router.use('/clients', clientsRouter);
 * - Leads Tracking: v1Router.use('/leads', leadsRouter);
 * - Projects:       v1Router.use('/projects', projectsRouter);
 * - Milestones:     v1Router.use('/projects/:projectId/milestones', milestonesRouter);
 * - Support Desk:   v1Router.use('/tickets', ticketsRouter);
 * - Portal Assets:  v1Router.use('/documents', documentsRouter);
 */

export default v1Router;
