import { prisma } from './src/config/db';
import { runSeeding } from './prisma/seed/index';

/**
 * Global Jest Teardown Hook
 *
 * Automatically restores development database seed data (bootstrap roles, default admin,
 * and default employee accounts) after integration tests complete.
 * This ensures running backend unit/integration tests never leaves the developer's database empty.
 */
afterAll(async () => {
  try {
    await runSeeding(prisma);
  } catch (error) {
    console.error('Failed to restore database seeding after test execution:', error);
  }
});
