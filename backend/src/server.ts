import http from 'http';
import app from './app';
import { config } from './config';
import { connectDB, prisma } from './config/db';
import { logger } from './utils/logger';

const port = config.app.port;
const server = http.createServer(app);

/**
 * Bootstraps and starts the Express HTTP Server.
 */
const startServer = async (): Promise<void> => {
  // Trigger PostgreSQL Database Connection check
  await connectDB();

  server.listen(port, () => {
    logger.info(`🚀 Server running in [${config.app.nodeEnv}] mode on port: ${port}`);
    logger.info(`🔗 Health check available at: http://localhost:${port}/api/v1/health`);
  });
};

// ==========================================
// UNEXPECTED PROCESS CRASH HANDLERS
// ==========================================

// Handle synchronous runtime bugs
process.on('uncaughtException', (err: Error) => {
  logger.error('CRITICAL: Uncaught Exception occurred!');
  logger.error(err.message);
  if (err.stack) {
    logger.error(err.stack);
  }
  logger.warn('Forcefully shutting down process to prevent corrupted states...');
  process.exit(1);
});

// Handle asynchronous promise failures
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('CRITICAL: Unhandled Promise Rejection occurred!');
  if (reason instanceof Error) {
    logger.error(reason.message);
    if (reason.stack) {
      logger.error(reason.stack);
    }
  } else {
    logger.error(`Rejection reason: ${reason}`);
  }

  logger.warn('Closing server and shutting down process...');
  server.close(() => {
    process.exit(1);
  });
});

// ==========================================
// GRACEFUL SHUTDOWN HANDLERS
// ==========================================

const handleGracefulShutdown = (signal: string): void => {
  logger.warn(`Received signal [${signal}]. Starting graceful shutdown...`);

  // Stop accepting new HTTP requests
  server.close(async () => {
    logger.info('HTTP server has been closed and stopped accepting requests.');

    try {
      // Disconnect Prisma client connection cleanly
      await prisma.$disconnect();
      logger.info('Prisma connection has been closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error occurred while disconnecting Prisma Client:', err);
      process.exit(1);
    }
  });

  // Set a fallback timeout to force shutdown if graceful cleanup takes too long
  setTimeout(() => {
    logger.error('Shutdown timed out. Forcefully exiting process.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Launch Server
startServer();
