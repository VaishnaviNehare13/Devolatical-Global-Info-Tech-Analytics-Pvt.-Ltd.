import { CorsOptions } from 'cors';
import { env } from './env';

/**
 * Configuration options for Cross-Origin Resource Sharing (CORS)
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // In development mode, allow requests with no origin (e.g., Postman, curl, mobile apps)
    if (!origin && env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    const allowedOrigin = env.CORS_ORIGIN;

    // Check if origin matches the allowed CORS_ORIGIN or if wildcard is used
    if (allowedOrigin === '*' || !origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Request origin is not allowed access.'));
    }
  },
  // Allows the client to send HTTP cookies, authorization headers, or TLS client certificates
  credentials: true,
  // Allowed HTTP verbs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // HTTP headers client is allowed to send
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  // Provide a status code for successful OPTIONS requests (legacy browsers compatibility)
  optionsSuccessStatus: 200,
};
