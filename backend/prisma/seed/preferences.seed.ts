import { PrismaClient } from '@prisma/client';
import { SEED_USERS } from './constants';

/**
 * User Preferences Seeder Module
 *
 * Responsible for seeding default appearance, localization, and system notification
 * configurations linked directly to user profiles.
 * Runs atomically inside a transaction per user and supports full idempotency.
 *
 * @param prisma Shared PrismaClient instance
 */
export async function seedPreferences(prisma: PrismaClient): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Starting Preferences Seeder...');

  // ==========================================
  // PHASE 1: READ & VALIDATION (Outside Transaction)
  // ==========================================

  // 1. Validate configuration constants
  if (!SEED_USERS || !Array.isArray(SEED_USERS) || SEED_USERS.length === 0) {
    throw new Error('Preferences Seeder Error: Missing SEED_USERS configuration.');
  }

  // ==========================================
  // PHASE 2: IDEMPOTENT PREFERENCES SEEDING
  // ==========================================
  for (const userConfig of SEED_USERS) {
    if (!userConfig.email) {
      throw new Error('Preferences Seeder Error: Missing user email in configuration.');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userConfig.email },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new Error(
        `Preferences Seeder Error: Bootstrap user (${userConfig.email}) not found. Execute Users Seeder before Preferences Seeder.`
      );
    }

    // Query the UserPreference table for this user
    const existingPreference = await prisma.userPreference.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    const isPreferenceMissing = !existingPreference;

    try {
      if (isPreferenceMissing) {
        await prisma.$transaction(async (tx) => {
          await tx.userPreference.create({
            data: {
              userId: user.id,
            },
          });
        });
        console.log(`✓ Preferences created for ${user.email}`);
      } else {
        console.log(`✓ Preferences already exist for ${user.email}`);
      }
    } catch (error: any) {
      throw new Error(`Preferences Seeder Error: Database transaction failure for ${user.email}. Details: ${error.message}`);
    }
  }

  console.log('Preferences Seeder Completed Successfully');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
