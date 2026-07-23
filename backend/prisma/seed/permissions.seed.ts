import { PrismaClient } from '@prisma/client';
import { IDENTITY_PERMISSIONS } from './constants';

/**
 * Permissions Seeder Module
 * 
 * Responsible for seeding modular permission records containing system resources,
 * module classifications, and permitted actions.
 * 
 * Uses Prisma upsert() with composite unique key: (module, resource, action)
 * 
 * @param prisma Shared PrismaClient instance
 */
export async function seedPermissions(prisma: PrismaClient): Promise<void> {
  console.log('Starting Permissions Seeder...');

  for (const permission of IDENTITY_PERMISSIONS) {
    const upsertedPermission = await prisma.permission.upsert({
      where: {
        module_resource_action: {
          module: permission.module,
          resource: permission.resource,
          action: permission.action,
        },
      },
      update: {
        name: permission.name,
        code: permission.code,
        description: permission.description,
        isActive: true,
        isSystem: true,
        displayOrder: permission.displayOrder,
      },
      create: {
        name: permission.name,
        code: permission.code,
        description: permission.description,
        module: permission.module,
        resource: permission.resource,
        action: permission.action,
        isActive: true,
        isSystem: true,
        displayOrder: permission.displayOrder,
      },
    });

    console.log(`✓ ${upsertedPermission.code}`);
  }

  console.log('Permissions Seeder Completed.');
}
