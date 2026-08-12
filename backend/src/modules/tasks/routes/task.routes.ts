import { Router, RequestHandler } from 'express';
import { TaskController } from '../controllers';
import { validate } from '../../../middleware';
import { CreateTaskSchema, UpdateTaskSchema, FindTasksSchema, TaskIdParamSchema } from '../dto';

/**
 * Factory function to configure and return the Tasks Express Router.
 * Applies authentication, authorization, and Zod validation middleware schemas.
 *
 * @param taskController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createTasksRouter(
  taskController: TaskController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Enforce authentication and authorization across all task routes
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // List all tasks with paginated search parameters
  router.get('/', validate({ query: FindTasksSchema }), taskController.listTasks);

  // Get detailed task information by ID
  router.get('/:id', validate({ params: TaskIdParamSchema }), taskController.getTaskById);

  // Create a new task
  router.post('/', validate({ body: CreateTaskSchema }), taskController.createTask);

  // Update task details
  router.patch(
    '/:id',
    validate({
      params: TaskIdParamSchema,
      body: UpdateTaskSchema,
    }),
    taskController.updateTask
  );

  // Archive (soft delete) a task
  router.delete('/:id', validate({ params: TaskIdParamSchema }), taskController.archiveTask);

  // Restore an archived task back to active status
  router.post('/:id/restore', validate({ params: TaskIdParamSchema }), taskController.restoreTask);

  return router;
}
