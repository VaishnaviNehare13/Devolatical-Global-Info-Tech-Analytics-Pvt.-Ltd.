import { Router, RequestHandler } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validate } from '../../../middleware';
import { IdParamSchema } from '../../../shared/dto/id-param.dto';
import { CreateProjectSchema, UpdateProjectSchema, FindProjectsSchema } from '../dto';

/**
 * Factory function to configure and return the Projects Express Router.
 * Applies authentication, authorization, and Zod validation middleware schemas.
 *
 * @param projectController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createProjectsRouter(
  projectController: ProjectController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Enforce authentication and authorization across all project routes
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // List all projects with paginated search parameters
  router.get('/', validate({ query: FindProjectsSchema }), projectController.listProjects);

  // Get detailed project information by ID
  router.get('/:id', validate({ params: IdParamSchema }), projectController.getProjectById);

  // Create a new project profile
  router.post('/', validate({ body: CreateProjectSchema }), projectController.createProject);

  // Update project details
  router.patch(
    '/:id',
    validate({
      params: IdParamSchema,
      body: UpdateProjectSchema,
    }),
    projectController.updateProject
  );

  // Archive (soft delete) a project profile
  router.delete('/:id', validate({ params: IdParamSchema }), projectController.archiveProject);

  // Restore an archived project back to PLANNING status
  router.post(
    '/:id/restore',
    validate({ params: IdParamSchema }),
    projectController.restoreProject
  );

  return router;
}
