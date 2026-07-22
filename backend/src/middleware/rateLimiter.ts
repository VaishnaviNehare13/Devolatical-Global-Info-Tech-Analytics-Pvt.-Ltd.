import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';
import { Messages } from '../constants/messages';

/**
 * Global rate-limiting middleware to protect against DoS, brute-force attacks, and scraping.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true, // Return rate limit info in the standard `RateLimit-*` headers
  legacyHeaders: false, // Disable legacy `X-RateLimit-*` headers
  // Custom response matching our standard API structure
  message: ApiResponse.error(Messages.TOO_MANY_REQUESTS),
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
});
