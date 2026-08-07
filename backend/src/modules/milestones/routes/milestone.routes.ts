import { Router, RequestHandler } from 'express';
import { MilestoneController } from '../controllers/milestone.controller';
import { validate } from '../../../middleware';
import {
  CreateMilestoneSchema,
  UpdateMilestoneSchema,
  FindMilestonesSchema,
  MilestoneIdParamSchema,
} from '../dto';

/**
 * Factory function to configure and return the Milestones Express Router.
 * Applies authentication, authorization, and Zod validation middleware schemas.
 *
 * @param milestoneController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createMilestonesRouter(
  milestoneController: MilestoneController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router({ mergeParams: true });

  // Enforce authentication and authorization across all milestone routes
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // List all milestones with paginated search parameters
  router.get('/', validate({ query: FindMilestonesSchema }), milestoneController.listMilestones);

  // Get detailed milestone information by ID
  router.get(
    '/:id',
    validate({ params: MilestoneIdParamSchema }),
    milestoneController.getMilestoneById
  );

  // Create a new milestone
  router.post('/', validate({ body: CreateMilestoneSchema }), milestoneController.createMilestone);

  // Update milestone details
  router.patch(
    '/:id',
    validate({
      params: MilestoneIdParamSchema,
      body: UpdateMilestoneSchema,
    }),
    milestoneController.updateMilestone
  );

  // Archive (soft delete) a milestone
  router.delete(
    '/:id',
    validate({ params: MilestoneIdParamSchema }),
    milestoneController.archiveMilestone
  );

  // Restore an archived milestone back to active status
  router.post(
    '/:id/restore',
    validate({ params: MilestoneIdParamSchema }),
    milestoneController.restoreMilestone
  );

  return router;
}
