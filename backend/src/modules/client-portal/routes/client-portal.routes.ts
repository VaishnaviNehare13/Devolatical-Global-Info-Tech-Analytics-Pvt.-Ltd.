import { Router, RequestHandler } from 'express';
import { ClientPortalController } from '../controllers/client-portal.controller';

export function createClientPortalRouter(
  controller: ClientPortalController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/overview', controller.getOverview);
  router.get('/projects', controller.getProjects);
  router.get('/invoices', controller.getInvoices);
  router.get('/tickets', controller.getTickets);
  router.get('/tickets/:id', controller.getTicketById);
  router.post('/tickets', controller.createTicket);
  router.post('/tickets/:id/comments', controller.createTicketComment);
  router.get('/documents', controller.getDocuments);
  router.get('/documents/:id/download', controller.downloadDocument);

  return router;
}
