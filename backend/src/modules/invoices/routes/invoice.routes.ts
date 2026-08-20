import { Router, RequestHandler } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { validate } from '../../../middleware';
import { CreateInvoiceSchema, UpdateInvoiceSchema, FindInvoicesSchema, InvoiceIdParamSchema } from '../dto/invoice.dto';

export function createInvoicesRouter(
  invoiceController: InvoiceController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', authorizeAdminMiddleware, validate({ query: FindInvoicesSchema }), invoiceController.listInvoices);
  router.get('/:id', authorizeAdminMiddleware, validate({ params: InvoiceIdParamSchema }), invoiceController.getInvoiceById);
  router.post('/', authorizeAdminMiddleware, validate({ body: CreateInvoiceSchema }), invoiceController.createInvoice);
  router.patch('/:id', authorizeAdminMiddleware, validate({ params: InvoiceIdParamSchema, body: UpdateInvoiceSchema }), invoiceController.updateInvoice);
  router.delete('/:id', authorizeAdminMiddleware, validate({ params: InvoiceIdParamSchema }), invoiceController.deleteInvoice);

  return router;
}
