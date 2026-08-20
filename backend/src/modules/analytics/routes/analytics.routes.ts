import { Router, RequestHandler } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { validate } from '../../../middleware';
import { AnalyticsQuerySchema, ReportExportQuerySchema } from '../dto/analytics.dto';

export function createAnalyticsRouter(
  controller: AnalyticsController,
  authMiddleware: RequestHandler,
  authorizeMiddleware: RequestHandler
): Router {
  const router = Router();

  // All analytics endpoints require authentication and RBAC authorization
  router.use(authMiddleware);
  router.use(authorizeMiddleware);

  // Summary Overview
  router.get('/overview', validate({ query: AnalyticsQuerySchema }), controller.getOverview);

  // Domain Analytics
  router.get('/leads', validate({ query: AnalyticsQuerySchema }), controller.getLeads);
  router.get('/financials', validate({ query: AnalyticsQuerySchema }), controller.getFinancials);
  router.get('/tickets', validate({ query: AnalyticsQuerySchema }), controller.getTickets);
  router.get('/projects', validate({ query: AnalyticsQuerySchema }), controller.getProjects);
  router.get('/pipelines', validate({ query: AnalyticsQuerySchema }), controller.getPipelines);

  // CSV Exports
  router.get('/leads/export', validate({ query: AnalyticsQuerySchema }), controller.exportLeadsCsv);
  router.get('/invoices/export', validate({ query: AnalyticsQuerySchema }), controller.exportInvoicesCsv);
  router.get('/tickets/export', validate({ query: AnalyticsQuerySchema }), controller.exportTicketsCsv);
  router.get('/projects/export', validate({ query: AnalyticsQuerySchema }), controller.exportProjectsCsv);

  // PDF Executive Report Export
  router.get('/reports/pdf', validate({ query: ReportExportQuerySchema }), controller.exportReportPdf);

  return router;
}
