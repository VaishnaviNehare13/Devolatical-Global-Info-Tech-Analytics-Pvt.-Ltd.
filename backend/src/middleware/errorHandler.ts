import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { config } from '../config';
import { HttpStatus } from '../constants/httpStatus';
import { Messages } from '../constants/messages';

/**
 * Centralized Error-Handling Middleware.
 * Captures all express throw statements and next(error) calls.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // Express requires 4 arguments to recognize it as an error-handling middleware
  _next: NextFunction
): void => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message: string = Messages.INTERNAL_ERROR;
  let errors: unknown = undefined;

  // Log error stack trace locally
  logger.error(`Error on ${req.method} ${req.originalUrl}: ${err.message}`);
  if (err.stack) {
    logger.error(err.stack);
  }

  // Parse known errors
  if (err instanceof AppError) {
    // Custom operational errors
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'AuthenticationError') {
    // Map operational authentication errors to 401 Unauthorized
    statusCode = HttpStatus.UNAUTHORIZED;
    message = err.message;
  } else if (err instanceof ZodError) {
    // Input validation errors
    statusCode = HttpStatus.BAD_REQUEST;
    message = Messages.VALIDATION_FAILED;
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database constraint errors
    statusCode = HttpStatus.BAD_REQUEST;
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        message = Messages.CONFLICT_UNIQUE;
        errors = { target: err.meta?.target };
        break;
      case 'P2025': // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        message = Messages.DB_RECORD_NOT_EXIST;
        break;
      default:
        message = `Database query error: ${err.message}`;
        break;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    // Invalid schema input to prisma query
    statusCode = HttpStatus.BAD_REQUEST;
    message = Messages.DB_SYNTAX_ERROR;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    // Prisma client failed to connect to database
    statusCode = HttpStatus.SERVICE_UNAVAILABLE;
    message = Messages.DB_OFFLINE;
  }

  // Build uniform error payload
  const errorPayload: Record<string, unknown> = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors !== undefined) {
    errorPayload.errors = errors;
  }

  // Include error stack trace only when in development mode for easier debugging
  if (config.app.nodeEnv === 'development') {
    errorPayload.stack = err.stack;
  }

  res.status(statusCode).json(errorPayload);
};
