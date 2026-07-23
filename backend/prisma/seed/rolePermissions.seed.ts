import { PrismaClient } from '@prisma/client';
import { ROLE_PERMISSION_MAPPINGS } from './constants';

/**
 * Role-Permissions Mapping Seeder Module
 * 
 * Establishes relations between roles and permissions using the role_permissions
 * join table. Uses Prisma upsert with the composite key (roleId, permissionId).
 * 
 * @param prisma Shared PrismaClient instance
 */
export async function seedRolePermissions(prisma: PrismaClient): Promise<void> {
  console.log('Starting Role Permissions Seeder...');

  for (const mapping of ROLE_PERMISSION_MAPPINGS) {
    const role = await prisma.role.findUnique({
      where: { code: mapping.roleCode },
    });

    if (!role) {
      throw new Error(`[Role-Permissions Seeder] Role with code "${mapping.roleCode}" not found in database.`);
    }

    for (const permissionCode of mapping.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permissionCode },
      });

      if (!permission) {
        throw new Error(`[Role-Permissions Seeder] Permission with code "${permissionCode}" not found in database.`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {
          isGranted: true,
        },
        create: {
          roleId: role.id,
          permissionId: permission.id,
          isGranted: true,
        },
      });

      console.log(`✓ ${mapping.roleCode} -> ${permissionCode}`);
    }
  }

  console.log('Role Permissions Seeder Completed.');
}
