import { Request, Response, NextFunction } from 'express';
import { PipelineService } from '../services/pipeline.service';
import { FindPipelinesInput, CreatePipelineInput, UpdatePipelineInput, UpdatePipelineStatusInput } from '../dto/pipeline.dto';

export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  public listPipelines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options = req.query as unknown as FindPipelinesInput;
      const result = await this.pipelineService.listPipelines(options);
      res.status(200).json({
        success: true,
        message: 'Data pipelines retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getPipelineById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pipeline = await this.pipelineService.getPipelineById(id);
      res.status(200).json({
        success: true,
        message: 'Data pipeline retrieved successfully.',
        data: pipeline,
      });
    } catch (error) {
      next(error);
    }
  };

  public createPipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreatePipelineInput;
      const pipeline = await this.pipelineService.createPipeline(body);
      res.status(201).json({
        success: true,
        message: 'Data pipeline created successfully.',
        data: pipeline,
      });
    } catch (error) {
      next(error);
    }
  };

  public updatePipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const body = req.body as UpdatePipelineInput;
      const pipeline = await this.pipelineService.updatePipeline(id, body);
      res.status(200).json({
        success: true,
        message: 'Data pipeline updated successfully.',
        data: pipeline,
      });
    } catch (error) {
      next(error);
    }
  };

  public updatePipelineStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, errorMessage } = req.body as UpdatePipelineStatusInput;
      const pipeline = await this.pipelineService.updatePipelineStatus(id, status, errorMessage);
      res.status(200).json({
        success: true,
        message: `Data pipeline status updated to ${status}.`,
        data: pipeline,
      });
    } catch (error) {
      next(error);
    }
  };

  public deletePipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.pipelineService.deletePipeline(id);
      res.status(200).json({
        success: true,
        message: 'Data pipeline archived successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  public getTelemetryMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.pipelineService.getTelemetryMetrics();
      res.status(200).json({
        success: true,
        message: 'Pipeline telemetry metrics retrieved successfully.',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };
}
