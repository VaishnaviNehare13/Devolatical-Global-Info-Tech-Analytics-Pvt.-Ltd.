import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

declare global {
  // Allow global var declarations in typescript
  var prisma: PrismaClient | undefined;
}

// In development, prevent multiple instances of Prisma Client from being instantiated
// on hot reloads. In production, we always instantiate a single client.
export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Hook to log prisma queries in development
if (env.NODE_ENV === 'development') {
  (prisma as PrismaClient).$on(
    'query' as never,
    (e: { query: string; params: string; duration: number }) => {
      logger.debug(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
    }
  );
}

/**
 * Connect to the PostgreSQL Database and log status.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('🔌 Connected to PostgreSQL Database successfully.');
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL Database.');
    if (error instanceof Error) {
      logger.error(`Error details: ${error.message}`);
    } else {
      logger.error('Unknown database connection error:', error);
    }
    logger.warn(
      'The application will proceed, but database queries will fail. Ensure your PostgreSQL service is running and DATABASE_URL is correct.'
    );
  }
};
