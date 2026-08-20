import { Request, Response, NextFunction } from 'express';
import { SystemMetricsService } from './system-metrics.service';
import { HttpStatus } from '../../constants/httpStatus';

export class SystemMetricsController {
  constructor(private readonly metricsService: SystemMetricsService) {}

  public getSystemMetrics = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.metricsService.getSystemMetrics();

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'System telemetry metrics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
