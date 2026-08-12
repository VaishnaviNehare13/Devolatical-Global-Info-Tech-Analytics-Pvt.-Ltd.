import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { TaskRepository } from './repository/task.repository';
import { TaskService } from './service/task.service';
import { TaskController } from './controllers/task.controller';
import { createTasksRouter } from './routes/task.routes';

// Import required external dependencies
import { UserRepository } from '../users/repositories/user.repository';
import { ProjectRepository } from '../projects/repository/project.repository';
import { MilestoneRepository } from '../milestones/repository/milestone.repository';
import { AuditLogRepository } from '../audit-logs/repository/audit-log.repository';
import { AuditLogService } from '../audit-logs/service/audit-log.service';

/**
 * Bootstraps the Tasks Module. Instantiates the repository, service, and controller,
 * and returns the configured Express Router.
 *
 * @param prisma Database client instance
 * @param authMiddleware JWT Authentication RequestHandler
 * @param authorizeAdminMiddleware RBAC Admin Authorization RequestHandler
 * @returns Configured Express Router
 */
export function createTasksModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const taskRepository = new TaskRepository(prisma);
  const userRepository = new UserRepository(prisma);
  const projectRepository = new ProjectRepository(prisma);
  const milestoneRepository = new MilestoneRepository(prisma);
  const auditLogRepository = new AuditLogRepository(prisma);
  const auditLogService = new AuditLogService(auditLogRepository);

  const taskService = new TaskService(
    taskRepository,
    userRepository,
    projectRepository,
    milestoneRepository,
    auditLogService
  );
  const taskController = new TaskController(taskService);

  return createTasksRouter(taskController, authMiddleware, authorizeAdminMiddleware);
}
