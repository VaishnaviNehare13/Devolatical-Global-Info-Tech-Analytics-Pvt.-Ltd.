import { parsedEnv } from './env.schema';
import { deepFreeze } from '../shared/utils/deep-freeze';

/**
 * Enterprise Application Configuration
 *
 * Aggregates validated environment variables into logically organized,
 * strongly-typed, and deeply immutable configuration domains.
 */
const rawConfig = {
  app: {
    nodeEnv: parsedEnv.NODE_ENV,
    port: parsedEnv.PORT,
    rateLimitWindowMs: parsedEnv.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: parsedEnv.RATE_LIMIT_MAX,
  },
  database: {
    url: parsedEnv.DATABASE_URL,
  },
  jwt: {
    accessSecret: parsedEnv.JWT_ACCESS_SECRET,
    refreshSecret: parsedEnv.JWT_REFRESH_SECRET,
    accessExpiresIn: parsedEnv.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: parsedEnv.JWT_REFRESH_EXPIRES_IN,
    issuer: parsedEnv.JWT_ISSUER,
    audience: parsedEnv.JWT_AUDIENCE,
    algorithm: parsedEnv.JWT_ALGORITHM,
  },
  security: {
    bcryptSaltRounds: parsedEnv.BCRYPT_SALT_ROUNDS,
  },
  email: {
    host: parsedEnv.SMTP_HOST,
    port: parsedEnv.SMTP_PORT,
    username: parsedEnv.SMTP_USER,
    password: parsedEnv.SMTP_PASSWORD,
    from: parsedEnv.SMTP_FROM,
  },
  cors: {
    origin: parsedEnv.CORS_ORIGIN,
  },
};

// Enforce deep immutability at runtime
export const config = deepFreeze(rawConfig);

export type ConfigType = typeof config;
