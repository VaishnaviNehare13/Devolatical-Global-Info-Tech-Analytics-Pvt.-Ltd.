import { PipelineRepository, PaginatedPipelinesOutput, PipelineTelemetryMetrics } from '../repositories/pipeline.repository';
import { CreatePipelineInput, UpdatePipelineInput, FindPipelinesInput } from '../dto/pipeline.dto';
import { DataPipeline, PipelineStatus, PrismaClient } from '@prisma/client';
import { AppError } from '../../../utils/appError';

export class PipelineService {
  constructor(
    private readonly pipelineRepository: PipelineRepository,
    private readonly prisma: PrismaClient
  ) {}

  public async createPipeline(data: CreatePipelineInput): Promise<DataPipeline> {
    if (data.clientId) {
      const client = await this.prisma.client.findFirst({
        where: { id: data.clientId, deletedAt: null },
      });
      if (!client) {
        throw new AppError('Referenced client organization does not exist or is deleted.', 400);
      }
    }

    if (data.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: data.projectId, deletedAt: null },
      });
      if (!project) {
        throw new AppError('Referenced project does not exist or is deleted.', 400);
      }
    }

    return this.pipelineRepository.create(data);
  }

  public async getPipelineById(id: string): Promise<DataPipeline> {
    const pipeline = await this.pipelineRepository.findById(id);
    if (!pipeline) {
      throw new AppError(`Data Pipeline '${id}' not found.`, 404);
    }
    return pipeline;
  }

  public async listPipelines(options: FindPipelinesInput): Promise<PaginatedPipelinesOutput> {
    return this.pipelineRepository.findMany(options);
  }

  public async updatePipeline(id: string, data: UpdatePipelineInput): Promise<DataPipeline> {
    const existing = await this.pipelineRepository.findById(id);
    if (!existing) {
      throw new AppError(`Data Pipeline '${id}' not found.`, 404);
    }

    const updated = await this.pipelineRepository.update(id, data);
    if (!updated) {
      throw new AppError(`Failed to update Data Pipeline '${id}'.`, 500);
    }
    return updated;
  }

  public async updatePipelineStatus(id: string, status: PipelineStatus, errorMessage?: string): Promise<DataPipeline> {
    const existing = await this.pipelineRepository.findById(id);
    if (!existing) {
      throw new AppError(`Data Pipeline '${id}' not found.`, 404);
    }

    const updated = await this.pipelineRepository.updateStatus(id, status, errorMessage);
    if (!updated) {
      throw new AppError(`Failed to update status for Data Pipeline '${id}'.`, 500);
    }
    return updated;
  }

  public async deletePipeline(id: string): Promise<{ success: boolean }> {
    const success = await this.pipelineRepository.softDelete(id);
    if (!success) {
      throw new AppError(`Data Pipeline '${id}' not found or already deleted.`, 404);
    }
    return { success: true };
  }

  public async getTelemetryMetrics(): Promise<PipelineTelemetryMetrics> {
    return this.pipelineRepository.getTelemetryMetrics();
  }
}
