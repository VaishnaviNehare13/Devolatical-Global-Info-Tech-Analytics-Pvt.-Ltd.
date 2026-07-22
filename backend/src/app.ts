import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { env } from './config/env';
import { corsOptions } from './config/cors';
import { globalRateLimiter } from './middleware/rateLimiter';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import v1Router from './routes/v1';

const app: Application = express();

// ==========================================
// SECURITY & REQUEST PARSING MIDDLEWARE
// ==========================================

// HTTP header security
app.use(helmet());

// Compress all HTTP responses
app.use(compression());

// Cross-Origin Resource Sharing
app.use(cors(corsOptions));

// HTTP Request logging
if (env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Global Rate Limiter for all routes
app.use(globalRateLimiter);

// ==========================================
// API ROUTES
// ==========================================

// Mount versioned API routes
app.use('/api/v1', v1Router);

// ==========================================
// ERROR & NOT FOUND HANDLING
// ==========================================

// Catch 404 routes and forward to error handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
