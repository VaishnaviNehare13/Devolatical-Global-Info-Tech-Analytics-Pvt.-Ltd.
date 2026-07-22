import { Router, Request, Response } from 'express';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { HttpStatus } from '../../constants/httpStatus';
import { Messages } from '../../constants/messages';
import { ApiResponse } from '../../utils/apiResponse';
import { logger } from '../../utils/logger';

const healthRouter = Router();

/**
 * @route GET /api/v1/health
 * @desc System health check endpoint
 * @access Public
 */
healthRouter.get('/health', async (req: Request, res: Response) => {
  // Log incoming health check requests
  logger.info(`Health check endpoint pinged from IP: ${req.ip}`);

  const payloadData = {
    status: 'UP',
    database: 'connected',
    environment: env.NODE_ENV,
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  };

  try {
    // Run a basic select query to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;

    res.status(HttpStatus.OK).json(new ApiResponse(true, Messages.HEALTH_SYSTEM_UP, payloadData));
  } catch {
    payloadData.database = 'unreachable';

    res
      .status(HttpStatus.SERVICE_UNAVAILABLE)
      .json(new ApiResponse(false, Messages.DB_UNREACHABLE, payloadData));
  }
});

export default healthRouter;
