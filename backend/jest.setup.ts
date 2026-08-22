import dotenv from 'dotenv';
import path from 'path';

// Force load .env.test environment variables during Jest test execution
dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true });

// SAFETY GUARD: Ensure automated tests NEVER run against development database
const dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.includes('devolatical_db') && !dbUrl.includes('devolatical_test_db')) {
  throw new Error(
    'SAFETY ERROR: Automated tests cannot run against development database (devolatical_db). Tests must use isolated devolatical_test_db.'
  );
}

/**
 * Global Jest Teardown Hook
 */
afterAll(async () => {
  // Global teardown hook
});
