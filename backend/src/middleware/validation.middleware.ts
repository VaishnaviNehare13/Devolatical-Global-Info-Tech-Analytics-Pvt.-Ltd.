import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/appError';

/**
 * Framework-level Validation Error mapping raw ZodErrors into AppErrors.
 */
export class ValidationError extends AppError {
  constructor(zodError: ZodError) {
    const errorDetails = zodError.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    super('Validation failed', 400, errorDetails);
    this.name = 'ValidationError';
  }
}

export interface RequestValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Generic Express request validation middleware using Zod.
 * Validates request payload properties and updates the request object with parsed results.
 * Wraps Zod validation failures in a custom ValidationError.
 *
 * @param schema Either a direct ZodSchema (validates body) or a multi-target schema object.
 */
export function validate(schema: ZodSchema | RequestValidationSchemas): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('safeParseAsync' in schema || 'parseAsync' in schema) {
        // Default target: body
        req.body = await (schema as ZodSchema).parseAsync(req.body);
      } else {
        const target = schema as RequestValidationSchemas;
        if (target.body) {
          req.body = await target.body.parseAsync(req.body);
        }
        if (target.query) {
          req.query = await target.query.parseAsync(req.query);
        }
        if (target.params) {
          req.params = await target.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError(error));
      } else {
        next(error);
      }
    }
  };
}
