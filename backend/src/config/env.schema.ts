import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from the .env file in the backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Database
  DATABASE_URL: z.string().min(1, 'is required'),

  // Authentication
  JWT_ACCESS_SECRET: z.string().min(16, 'must be at least 16 characters long'),
  JWT_REFRESH_SECRET: z.string().min(16, 'must be at least 16 characters long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().min(1, 'is required'),
  JWT_AUDIENCE: z.string().min(1, 'is required'),
  JWT_ALGORITHM: z.enum(['HS256']).default('HS256'),

  // Security
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  // Email
  SMTP_HOST: z.string().min(1, 'is required'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1, 'is required'),
  SMTP_PASSWORD: z.string().min(1, 'is required'),
  SMTP_FROM: z.string().email('must be a valid email address'),
});

// Validate process.env
const result = envSchema.safeParse(process.env);

if (!result.success) {
  const missing: string[] = [];
  const invalid: string[] = [];

  result.error.issues.forEach((issue) => {
    const fieldName = issue.path.join('.');
    
    // Check if the variable is missing (undefined received)
    if (
      (issue.code === 'invalid_type' && issue.received === 'undefined') ||
      (issue.code === 'too_small' && issue.type === 'string' && issue.minimum === 1)
    ) {
      missing.push(fieldName);
    } else {
      invalid.push(`${fieldName} ${issue.message}`);
    }
  });

  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Environment Configuration Error');
  
  if (missing.length > 0) {
    console.error('\nMissing Variables');
    missing.forEach((field) => console.error(`✗ ${field}`));
  }

  if (invalid.length > 0) {
    console.error('\nInvalid Variables');
    invalid.forEach((message) => console.error(`✗ ${message}`));
  }

  console.error('\nApplication startup aborted.');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(1);
}

// Export raw validated data
export const parsedEnv = result.data;
export type ParsedEnvType = z.infer<typeof envSchema>;
