import { Router, RequestHandler } from 'express';
import { LeadController } from '../controllers';
import { validate } from '../../../middleware';
import { CreateLeadSchema, UpdateLeadSchema, FindLeadsSchema, LeadIdParamSchema } from '../dto';

/**
 * Factory function to configure and return the Leads Express Router.
 * Applies authentication, authorization, and Zod validation middleware schemas.
 *
 * @param leadController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createLeadsRouter(
  leadController: LeadController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Public endpoint: Create a new lead profile (from public contact form)
  router.post('/', validate({ body: CreateLeadSchema }), leadController.createLead);

  // Administrative protected endpoints
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // List all leads with paginated search parameters
  router.get('/', validate({ query: FindLeadsSchema }), leadController.listLeads);

  // Get detailed lead information by ID
  router.get('/:id', validate({ params: LeadIdParamSchema }), leadController.getLeadById);

  // Update lead details
  router.patch(
    '/:id',
    validate({
      params: LeadIdParamSchema,
      body: UpdateLeadSchema,
    }),
    leadController.updateLead
  );

  // Archive (soft delete) a lead profile
  router.delete('/:id', validate({ params: LeadIdParamSchema }), leadController.archiveLead);

  // Restore an archived lead back to active status
  router.post('/:id/restore', validate({ params: LeadIdParamSchema }), leadController.restoreLead);

  return router;
}
