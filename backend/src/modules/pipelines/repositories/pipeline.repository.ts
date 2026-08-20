import { PrismaClient, DataPipeline, PipelineStatus, Prisma } from '@prisma/client';
import { CreatePipelineInput, UpdatePipelineInput, FindPipelinesInput } from '../dto/pipeline.dto';

export interface PaginatedPipelinesOutput {
  items: DataPipeline[];
  total: number;
  page: number;
  limit: number;
  pages: number;
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

export class PipelineRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: CreatePipelineInput): Promise<DataPipeline> {
    return this.prisma.dataPipeline.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        status: data.status || PipelineStatus.ACTIVE,
        source: data.source || 'Kafka Ingestion Engine',
        target: data.target || 'Snowflake Core DW',
        volume: data.volume || '1.2M req/hr',
        progress: data.progress ?? 0,
        clientId: data.clientId ?? null,
        projectId: data.projectId ?? null,
        lastRunAt: new Date(),
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  }

  public async findById(id: string): Promise<DataPipeline | null> {
    return this.prisma.dataPipeline.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  }

  public async findMany(options: FindPipelinesInput): Promise<PaginatedPipelinesOutput> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.DataPipelineWhereInput = {
      deletedAt: null,
    };

    if (options.status) {
      where.status = options.status;
    }

    if (options.clientId) {
      where.clientId = options.clientId;
    }

    if (options.projectId) {
      where.projectId = options.projectId;
    }

    if (options.search && options.search.trim()) {
      const query = options.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { source: { contains: query, mode: 'insensitive' } },
        { target: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.dataPipeline.count({ where }),
      this.prisma.dataPipeline.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  public async findManyByClient(clientId: string): Promise<DataPipeline[]> {
    return this.prisma.dataPipeline.findMany({
      where: { clientId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  public async update(id: string, data: UpdatePipelineInput): Promise<DataPipeline | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    return this.prisma.dataPipeline.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.target !== undefined && { target: data.target }),
        ...(data.volume !== undefined && { volume: data.volume }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(data.projectId !== undefined && { projectId: data.projectId }),
        lastRunAt: new Date(),
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  }

  public async updateStatus(id: string, status: PipelineStatus, errorMessage?: string): Promise<DataPipeline | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    return this.prisma.dataPipeline.update({
      where: { id },
      data: {
        status,
        ...(errorMessage !== undefined && { errorMessage }),
        lastRunAt: new Date(),
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  }

  public async softDelete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    await this.prisma.dataPipeline.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }

  public async getTelemetryMetrics(): Promise<PipelineTelemetryMetrics> {
    const [total, active, syncing, stopped, completed, failed, aggregateProgress] = await Promise.all([
      this.prisma.dataPipeline.count({ where: { deletedAt: null } }),
      this.prisma.dataPipeline.count({ where: { status: PipelineStatus.ACTIVE, deletedAt: null } }),
      this.prisma.dataPipeline.count({ where: { status: PipelineStatus.SYNCING, deletedAt: null } }),
      this.prisma.dataPipeline.count({ where: { status: PipelineStatus.STOPPED, deletedAt: null } }),
      this.prisma.dataPipeline.count({ where: { status: PipelineStatus.COMPLETED, deletedAt: null } }),
      this.prisma.dataPipeline.count({ where: { status: PipelineStatus.FAILED, deletedAt: null } }),
      this.prisma.dataPipeline.aggregate({
        where: { deletedAt: null },
        _avg: { progress: true },
      }),
    ]);

    return {
      totalPipelines: total,
      activePipelines: active,
      syncingPipelines: syncing,
      stoppedPipelines: stopped,
      completedPipelines: completed,
      failedPipelines: failed,
      averageProgress: Math.round(aggregateProgress._avg.progress || 0),
    };
  }
}
