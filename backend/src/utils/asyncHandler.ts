import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * A reusable wrapper to handle asynchronous Express routes and middleware.
 * Automatically catches any rejected promises and passes them to next(),
 * forwarding them to the centralized error handler.
 *
 * @param fn The asynchronous route handler function
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
