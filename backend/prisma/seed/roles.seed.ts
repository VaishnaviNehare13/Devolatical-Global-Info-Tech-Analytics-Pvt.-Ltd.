import { PrismaClient, RoleType } from '@prisma/client';
import { ROLE_CODES, ROLE_PRIORITIES } from './constants';

/**
 * Roles Seeder Module
 * 
 * Seeds exactly three system roles:
 * - Super Admin
 * - Admin
 * - Employee
 * 
 * Uses Prisma upsert() using the role code as the unique lookup key.
 * 
 * @param prisma Shared PrismaClient instance
 */
export async function seedRoles(prisma: PrismaClient): Promise<void> {
  console.log('🌱 [Roles Seeder] Starting Roles seeding...');

  const rolesToSeed = [
    {
      code: ROLE_CODES.SUPER_ADMIN,
      name: 'Super Admin',
      description: 'Super Administrator with full system control and administrative access.',
      priority: ROLE_PRIORITIES[ROLE_CODES.SUPER_ADMIN],
      isDefault: false,
    },
    {
      code: ROLE_CODES.ADMIN,
      name: 'Admin',
      description: 'Standard Administrator with permissions to manage organizational data.',
      priority: ROLE_PRIORITIES[ROLE_CODES.ADMIN],
      isDefault: false,
    },
    {
      code: ROLE_CODES.EMPLOYEE,
      name: 'Employee',
      description: 'Regular Employee with standard task and project access.',
      priority: ROLE_PRIORITIES[ROLE_CODES.EMPLOYEE],
      isDefault: true,
    },
  ];

  for (const role of rolesToSeed) {
    const upsertedRole = await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
        type: RoleType.SYSTEM,
        priority: role.priority,
        isActive: true,
        isDefault: role.isDefault,
        isSystem: true,
      },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        type: RoleType.SYSTEM,
        priority: role.priority,
        isActive: true,
        isDefault: role.isDefault,
        isSystem: true,
      },
    });

    console.log(`✅ [Roles Seeder] Upserted role: ${upsertedRole.name} (${upsertedRole.code})`);
  }

  console.log('🌱 [Roles Seeder] Roles seeding completed.');
}
