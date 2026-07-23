import { PrismaClient } from '@prisma/client';
import { DEFAULT_ADMIN } from './constants';

/**
 * User Preferences Seeder Module
 * 
 * Responsible for seeding default appearance, localization, and system notification
 * configurations linked directly to user profiles.
 * Runs atomically inside a transaction and supports full idempotency.
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
  if (!DEFAULT_ADMIN) {
    throw new Error('Preferences Seeder Error: Missing DEFAULT_ADMIN configuration.');
  }
  if (!DEFAULT_ADMIN.email) {
    throw new Error('Preferences Seeder Error: Missing DEFAULT_ADMIN.email.');
  }

  // 2. Find the bootstrap user using DEFAULT_ADMIN.email
  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN.email },
    select: { id: true },
  });

  if (!user) {
    throw new Error(
      'Preferences Seeder Error: Bootstrap Super Admin user not found. Execute Users Seeder before Preferences Seeder.'
    );
  }
  console.log('✓ Bootstrap user located');

  // 3. Query the UserPreference table for this user
  const existingPreference = await prisma.userPreference.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  const isPreferenceMissing = !existingPreference;

  // ==========================================
  // PHASE 2: DATABASE TRANSACTION (Writes Only)
  // ==========================================
  try {
    if (isPreferenceMissing) {
      await prisma.$transaction(async (tx) => {
        await tx.userPreference.create({
          data: {
            userId: user.id,
          },
        });
      });
      console.log('✓ Preferences created');
    } else {
      console.log('✓ Preferences already exist');
    }

    console.log('Preferences Seeder Completed Successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error: any) {
    throw new Error(`Preferences Seeder Error: Database transaction failure. Details: ${error.message}`);
  }
}

