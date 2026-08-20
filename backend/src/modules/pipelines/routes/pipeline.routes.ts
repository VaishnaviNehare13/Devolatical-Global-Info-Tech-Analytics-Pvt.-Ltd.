import { Router, RequestHandler } from 'express';
import { PipelineController } from '../controllers/pipeline.controller';
import { validate } from '../../../middleware';
import {
  FindPipelinesSchema,
  PipelineIdParamSchema,
  CreatePipelineSchema,
  UpdatePipelineSchema,
  UpdatePipelineStatusSchema,
} from '../dto/pipeline.dto';

export function createPipelinesRouter(
  controller: PipelineController,
  authMiddleware: RequestHandler,
  authorizeMiddleware: RequestHandler
): Router {
  const router = Router();

  // All pipeline endpoints require authentication and RBAC authorization
  router.use(authMiddleware);
  router.use(authorizeMiddleware);

  // Telemetry metrics endpoint
  router.get('/metrics', controller.getTelemetryMetrics);

  // List pipelines with pagination and filtering
  router.get('/', validate({ query: FindPipelinesSchema }), controller.listPipelines);

  // Get single pipeline by ID
  router.get('/:id', validate({ params: PipelineIdParamSchema }), controller.getPipelineById);

  // Create new data pipeline
  router.post('/', validate({ body: CreatePipelineSchema }), controller.createPipeline);

  // Update pipeline properties
  router.patch(
    '/:id',
    validate({ params: PipelineIdParamSchema, body: UpdatePipelineSchema }),
    controller.updatePipeline
  );

  // Update pipeline status
  router.patch(
    '/:id/status',
    validate({ params: PipelineIdParamSchema, body: UpdatePipelineStatusSchema }),
    controller.updatePipelineStatus
  );

  // Archive / soft-delete pipeline
  router.delete('/:id', validate({ params: PipelineIdParamSchema }), controller.deletePipeline);

  return router;
}
