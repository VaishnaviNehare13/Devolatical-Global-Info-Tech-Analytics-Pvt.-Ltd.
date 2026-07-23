import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';
import { Messages } from '../constants/messages';

/**
 * Global rate-limiting middleware to protect against DoS, brute-force attacks, and scraping.
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.app.rateLimitWindowMs,
  max: config.app.rateLimitMax,
  standardHeaders: true, // Return rate limit info in the standard `RateLimit-*` headers
  legacyHeaders: false, // Disable legacy `X-RateLimit-*` headers
  // Custom response matching our standard API structure
  message: ApiResponse.error(Messages.TOO_MANY_REQUESTS),
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
});
