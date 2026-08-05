import { Router, RequestHandler } from 'express';
import { ClientController } from '../controllers/client.controller';
import { validate } from '../../../middleware';
import { IdParamSchema } from '../../../shared/dto/id-param.dto';
import { CreateClientSchema, UpdateClientSchema, FindClientsSchema } from '../dto';

/**
 * Factory function to configure and return the Clients Express Router.
 * Applies authentication, authorization, and Zod validation middleware schemas.
 *
 * @param clientController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createClientsRouter(
  clientController: ClientController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Enforce authentication and authorization across all client routes
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // List all clients with paginated search parameters
  router.get('/', validate({ query: FindClientsSchema }), clientController.listClients);

  // Get detailed client information by ID
  router.get('/:id', validate({ params: IdParamSchema }), clientController.getClientById);

  // Create a new client profile
  router.post('/', validate({ body: CreateClientSchema }), clientController.createClient);

  // Update client details
  router.patch(
    '/:id',
    validate({
      params: IdParamSchema,
      body: UpdateClientSchema,
    }),
    clientController.updateClient
  );

  // Archive (soft delete) a client profile
  router.delete('/:id', validate({ params: IdParamSchema }), clientController.archiveClient);

  // Restore an archived client back to ACTIVE status
  router.post('/:id/restore', validate({ params: IdParamSchema }), clientController.restoreClient);

  return router;
}
