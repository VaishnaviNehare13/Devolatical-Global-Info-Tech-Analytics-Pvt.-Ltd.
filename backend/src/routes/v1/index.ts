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

// Permissions imports
import { createPermissionsModule } from '../../modules/permissions';

// Audit Logs imports
import { createAuditLogsModule } from '../../modules/audit-logs';

// Clients imports
import { createClientsModule } from '../../modules/clients';

// Projects imports
import { createProjectsModule } from '../../modules/projects';

// Milestones imports
import { createMilestonesModule } from '../../modules/milestones';

// Leads imports
import { createLeadsModule } from '../../modules/leads';

// Tickets imports
import { createTicketsModule } from '../../modules/tickets';

// Tasks imports
import { createTasksModule } from '../../modules/tasks';

// Documents imports
import { createDocumentsModule } from '../../modules/documents';

// Invoices imports
import { createInvoicesModule } from '../../modules/invoices/invoices.module';

// Client Portal imports
import { createClientPortalModule } from '../../modules/client-portal/client-portal.module';

// System Metrics imports
import { createSystemMetricsModule } from '../../modules/system-metrics';

// Careers imports
import { createCareersModule } from '../../modules/careers';

// Notifications imports
import { createNotificationsModule } from '../../modules/notifications';

// Pipelines imports
import { createPipelinesModule } from '../../modules/pipelines';

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
const authorizeStaff = authorize({
  roles: [SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.EMPLOYEE], // Internal staff roles
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

// Initialize and Mount Permissions Router
const permissionsRouter = createPermissionsModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/permissions', permissionsRouter);

// Initialize and Mount Audit Logs Router
const auditLogsRouter = createAuditLogsModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/audit-logs', auditLogsRouter);

// Initialize and Mount Clients Router
const clientsRouter = createClientsModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/clients', clientsRouter);

// Initialize and Mount Projects Router
const projectsRouter = createProjectsModule(prisma, authMiddleware.handle, authorizeStaff);
v1Router.use('/projects', projectsRouter);

// Initialize and Mount Milestones Router
const milestonesRouter = createMilestonesModule(prisma, authMiddleware.handle, authorizeStaff);
v1Router.use('/projects/:projectId/milestones', milestonesRouter);

// Initialize and Mount Leads Router
const leadsRouter = createLeadsModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/leads', leadsRouter);

// Initialize and Mount Tickets Router
const ticketsRouter = createTicketsModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/tickets', ticketsRouter);

// Initialize and Mount Tasks Router
const tasksRouter = createTasksModule(prisma, authMiddleware.handle, authorizeStaff);
v1Router.use('/tasks', tasksRouter);

// Initialize and Mount Documents Router
const documentsRouter = createDocumentsModule(prisma, authMiddleware.handle, authorizeStaff);
v1Router.use('/documents', documentsRouter);

// Initialize and Mount Invoices Router
const invoicesRouter = createInvoicesModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/invoices', invoicesRouter);

// Initialize and Mount Client Portal Router
const clientPortalRouter = createClientPortalModule(prisma, authMiddleware.handle);
v1Router.use('/client-portal', clientPortalRouter);

// Initialize and Mount System Metrics Router
const systemMetricsRouter = createSystemMetricsModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/system', systemMetricsRouter);

// Initialize and Mount Careers Router
const careersRouter = createCareersModule(prisma, authMiddleware.handle, authorizeAdmin);
v1Router.use('/careers', careersRouter);

// Initialize and Mount Notifications Router
const { router: notificationsRouter } = createNotificationsModule(prisma, authMiddleware.handle);
v1Router.use('/notifications', notificationsRouter);

// Initialize and Mount Pipelines Router
v1Router.use('/pipelines', createPipelinesModule(prisma, authMiddleware.handle, authorizeStaff));

export default v1Router;

