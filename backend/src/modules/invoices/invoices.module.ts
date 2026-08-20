import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { InvoiceRepository } from './repository/invoice.repository';
import { InvoiceService } from './service/invoice.service';
import { InvoiceController } from './controllers/invoice.controller';
import { createInvoicesRouter } from './routes/invoice.routes';

export function createInvoicesModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const repository = new InvoiceRepository(prisma);
  const service = new InvoiceService(repository);
  const controller = new InvoiceController(service);
  return createInvoicesRouter(controller, authMiddleware, authorizeAdminMiddleware);
}
