import { PrismaClient } from '@prisma/client';
import { runSeeding } from './seed/index';

const prisma = new PrismaClient();

/**
 * Enterprise Database Seeding Entry Point.
 * 
 * Responsible for:
 * 1. Initializing the shared PrismaClient instance.
 * 2. Invoking the main seeding coordinator.
 * 3. Ensuring clean database disconnection.
 * 4. Capturing and logging execution errors.
 */
async function main(): Promise<void> {
  try {
    await runSeeding(prisma);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Critical error in seeder execution:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
