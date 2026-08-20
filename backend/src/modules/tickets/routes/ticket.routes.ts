import { Router, RequestHandler } from 'express';
import { TicketController } from '../controllers';
import { validate } from '../../../middleware';
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  FindTicketsSchema,
  TicketIdParamSchema,
} from '../dto';

/**
 * Factory function to configure and return the Tickets Express Router.
 * Applies authentication, authorization, and Zod validation middleware schemas.
 *
 * @param ticketController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createTicketsRouter(
  ticketController: TicketController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Enforce authentication and authorization across all ticket routes
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // List all tickets with paginated search parameters
  router.get('/', validate({ query: FindTicketsSchema }), ticketController.listTickets);

  // Get detailed ticket information by ID
  router.get('/:id', validate({ params: TicketIdParamSchema }), ticketController.getTicketById);

  // Create a new ticket profile
  router.post('/', validate({ body: CreateTicketSchema }), ticketController.createTicket);

  // Update ticket details
  router.patch(
    '/:id',
    validate({
      params: TicketIdParamSchema,
      body: UpdateTicketSchema,
    }),
    ticketController.updateTicket
  );

  // Archive (soft delete) a ticket profile
  router.delete('/:id', validate({ params: TicketIdParamSchema }), ticketController.archiveTicket);

  // Restore an archived ticket back to active status
  router.post(
    '/:id/restore',
    validate({ params: TicketIdParamSchema }),
    ticketController.restoreTicket
  );

  // Get comments for a ticket
  router.get(
    '/:id/comments',
    validate({ params: TicketIdParamSchema }),
    ticketController.getComments
  );

  // Add a comment to a ticket
  router.post(
    '/:id/comments',
    validate({ params: TicketIdParamSchema }),
    ticketController.createComment
  );

  return router;
}
