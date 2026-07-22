import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';

/**
 * Middleware to handle unmatched routes (404 errors)
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res
    .status(HttpStatus.NOT_FOUND)
    .json(ApiResponse.error(`Resource not found: ${req.method} ${req.originalUrl}`));
};
