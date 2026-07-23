import { PrismaClient } from '@prisma/client';
import { seedRoles } from './roles.seed';
import { seedPermissions } from './permissions.seed';
import { seedRolePermissions } from './rolePermissions.seed';
import { seedUsers } from './users.seed';
import { seedPreferences } from './preferences.seed';

/**
 * Enterprise Database Seeding Coordinator
 * 
 * Coordinates the seeding process by executing individual seeding functions
 * in the correct order to respect database relational/foreign key constraints:
 * 
 * 1. Roles
 * 2. Permissions
 * 3. Role-Permissions (mapping roles to permissions)
 * 4. Users (linking users to roles)
 * 5. Preferences (linking preferences to users)
 * 
 * @param prisma Shared PrismaClient instance
 */
export async function runSeeding(prisma: PrismaClient): Promise<void> {
  console.log('🌱 Starting Enterprise Database Seeding...');
  
  await seedRoles(prisma);
  await seedPermissions(prisma);
  await seedRolePermissions(prisma);
  await seedUsers(prisma);
  await seedPreferences(prisma);
  
  console.log('🏁 Enterprise Database Seeding completed successfully!');
}
