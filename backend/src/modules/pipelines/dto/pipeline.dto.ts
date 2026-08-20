import { z } from 'zod';
import { PipelineStatus } from '@prisma/client';

export const PipelineIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Pipeline ID format. Must be a valid UUID.' }),
});

export const CreatePipelineSchema = z.object({
  name: z.string().min(2, { message: 'Pipeline name must be at least 2 characters.' }).max(100),
  description: z.string().optional(),
  status: z.nativeEnum(PipelineStatus).optional().default(PipelineStatus.ACTIVE),
  source: z.string().optional().default('Kafka Ingestion Engine'),
  target: z.string().optional().default('Snowflake Core DW'),
  volume: z.string().optional().default('1.2M req/hr'),
  progress: z.number().int().min(0).max(100).optional().default(0),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export const UpdatePipelineSchema = CreatePipelineSchema.partial();

export const UpdatePipelineStatusSchema = z.object({
  status: z.nativeEnum(PipelineStatus, { required_error: 'Pipeline status is required.' }),
  errorMessage: z.string().optional(),
});

export const FindPipelinesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(PipelineStatus).optional(),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type CreatePipelineInput = z.infer<typeof CreatePipelineSchema>;
export type UpdatePipelineInput = z.infer<typeof UpdatePipelineSchema>;
export type UpdatePipelineStatusInput = z.infer<typeof UpdatePipelineStatusSchema>;
export type FindPipelinesInput = z.infer<typeof FindPipelinesSchema>;
