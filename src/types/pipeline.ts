import type { BaseQueryParams } from './api';

export type PipelineStatus = 'ACTIVE' | 'SYNCING' | 'STOPPED' | 'COMPLETED' | 'FAILED';

export interface DataPipelineClientRef {
  id: string;
  name: string;
  code: string;
}

export interface DataPipelineProjectRef {
  id: string;
  name: string;
  code: string;
}

export interface DataPipeline {
  id: string;
  name: string;
  description: string | null;
  status: PipelineStatus;
  source: string;
  target: string;
  volume: string;
  progress: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  errorMessage: string | null;
  clientId: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  client?: DataPipelineClientRef | null;
  project?: DataPipelineProjectRef | null;
}

export interface PipelineTelemetryMetrics {
  totalPipelines: number;
  activePipelines: number;
  syncingPipelines: number;
  stoppedPipelines: number;
  completedPipelines: number;
  failedPipelines: number;
  averageProgress: number;
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  status?: PipelineStatus;
  source?: string;
  target?: string;
  volume?: string;
  progress?: number;
  clientId?: string;
  projectId?: string;
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  status?: PipelineStatus;
  source?: string;
  target?: string;
  volume?: string;
  progress?: number;
  clientId?: string;
  projectId?: string;
}

export interface UpdatePipelineStatusRequest {
  status: PipelineStatus;
  errorMessage?: string;
}

export interface FindPipelinesQuery extends BaseQueryParams {
  status?: PipelineStatus;
  clientId?: string;
  projectId?: string;
}
