import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { PipelineRepository } from './repositories/pipeline.repository';
import { PipelineService } from './services/pipeline.service';
import { PipelineController } from './controllers/pipeline.controller';
import { createPipelinesRouter } from './routes/pipeline.routes';

export { PipelineRepository, PipelineService, PipelineController };

export function createPipelinesModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler,
  authorizeMiddleware: RequestHandler
): Router {
  const repository = new PipelineRepository(prisma);
  const service = new PipelineService(repository, prisma);
  const controller = new PipelineController(service);
  return createPipelinesRouter(controller, authMiddleware, authorizeMiddleware);
}
