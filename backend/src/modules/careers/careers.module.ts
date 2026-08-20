import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { CareerRepository } from './repositories/career.repository';
import { CareerService } from './services/career.service';
import { CareerController } from './controllers/career.controller';
import { createCareerRouter } from './routes/career.routes';
import { AuditLogService } from '../audit-logs/service/audit-log.service';
import { AuditLogRepository } from '../audit-logs/repository/audit-log.repository';

export function createCareersModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeAdmin: RequestHandler
): Router {
  const repository = new CareerRepository(prisma);
  const auditLogRepository = new AuditLogRepository(prisma);
  const auditLogService = new AuditLogService(auditLogRepository);
  const service = new CareerService(repository, auditLogService);
  const controller = new CareerController(service);

  return createCareerRouter(controller, authMiddleware, authorizeAdmin);
}
