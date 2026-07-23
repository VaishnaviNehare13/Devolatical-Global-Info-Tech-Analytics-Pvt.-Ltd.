import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { DEFAULT_ADMIN, ROLE_CODES } from './constants';

/**
 * Users Seeder Module
 * 
 * Responsible for seeding the initial Super Administrator user,
 * creating their security credentials, and mapping their security roles.
 * Supports self-healing, multi-role bootstrapping, and runs write operations
 * atomically inside a transaction.
 * 
 * @param prisma Shared PrismaClient instance
 */
export async function seedUsers(prisma: PrismaClient): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Starting Users Seeder...');

  // ==========================================
  // PHASE 1: READ & VALIDATION (Outside Transaction)
  // ==========================================

  // 1. Validate configuration constants
  if (!DEFAULT_ADMIN) {
    throw new Error('Users Seeder Error: DEFAULT_ADMIN constant is missing in configurations.');
  }
  if (!DEFAULT_ADMIN.roles || !Array.isArray(DEFAULT_ADMIN.roles) || DEFAULT_ADMIN.roles.length === 0) {
    throw new Error('Users Seeder Error: DEFAULT_ADMIN.roles must be a non-empty array.');
  }
  if (!ROLE_CODES) {
    throw new Error('Users Seeder Error: ROLE_CODES constant is missing in configurations.');
  }

  // 2. Validate and retrieve roles from the database
  const rolesMap = new Map<string, { id: string; name: string; code: string }>();
  for (const roleCode of DEFAULT_ADMIN.roles) {
    const role = await prisma.role.findUnique({
      where: { code: roleCode },
      select: { id: true, name: true, code: true },
    });

    if (!role) {
      throw new Error(`Users Seeder Error: Role with code "${roleCode}" not found in database. Seed roles first.`);
    }
    rolesMap.set(roleCode, role);
  }
  console.log('✓ Bootstrap roles validated in database');

  // 3. Query existing user and their credential
  const existingUser = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN.email },
    select: { id: true },
  });

  let existingCredential = null;
  let existingUserRoles: { roleId: string }[] = [];

  if (existingUser) {
    existingCredential = await prisma.credential.findUnique({
      where: { userId: existingUser.id },
      select: { id: true },
    });

    existingUserRoles = await prisma.userRole.findMany({
      where: { userId: existingUser.id },
      select: { roleId: true },
    });
  }

  // 4. Determine exactly which records are missing
  const isUserMissing = !existingUser;
  const isCredentialMissing = !existingCredential;

  const missingRoleCodes: string[] = [];
  for (const roleCode of DEFAULT_ADMIN.roles) {
    const role = rolesMap.get(roleCode)!;
    const hasMapping = existingUserRoles.some((ur) => ur.roleId === role.id);
    if (isUserMissing || !hasMapping) {
      missingRoleCodes.push(roleCode);
    }
  }

  // 5. Generate bcrypt hash (12 salt rounds) outside the transaction
  const needsPasswordHash = isCredentialMissing;
  let passwordHash = '';

  if (needsPasswordHash) {
    try {
      const saltRounds = 12;
      passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, saltRounds);
    } catch (err: any) {
      throw new Error(`Users Seeder Error: Failed to hash password. Details: ${err.message}`);
    }
  }

  // ==========================================
  // PHASE 2: DATABASE TRANSACTION (Writes only)
  // ==========================================
  const hasWrites = isUserMissing || isCredentialMissing || missingRoleCodes.length > 0;

  try {
    if (hasWrites) {
      await prisma.$transaction(async (tx) => {
        let userId = existingUser?.id;

        // Write 1: Create User if missing
        if (isUserMissing) {
          const createdUser = await tx.user.create({
            data: {
              firstName: DEFAULT_ADMIN.firstName,
              lastName: DEFAULT_ADMIN.lastName,
              displayName: DEFAULT_ADMIN.displayName,
              email: DEFAULT_ADMIN.email,
              emailVerified: DEFAULT_ADMIN.emailVerified,
              status: DEFAULT_ADMIN.status,
            },
            select: { id: true },
          });
          userId = createdUser.id;
        }

        // Write 2: Create Credential if missing
        if (isCredentialMissing) {
          if (!userId) {
            throw new Error('Users Seeder Error: Cannot create credential without a valid userId.');
          }

          await tx.credential.create({
            data: {
              userId: userId,
              passwordHash,
              passwordChangedAt: new Date(),
              failedLoginAttempts: 0,
            },
          });
        }

        // Write 3: Create missing UserRole mappings
        for (const roleCode of missingRoleCodes) {
          const role = rolesMap.get(roleCode)!;
          if (!userId) {
            throw new Error(`Users Seeder Error: Cannot assign role "${roleCode}" without a valid userId.`);
          }

          await tx.userRole.create({
            data: {
              userId: userId,
              roleId: role.id,
              isActive: true,
            },
          });
        }
      });
    }

    // ==========================================
    // LOGGING STATUS
    // ==========================================
    console.log(isUserMissing ? '✓ User created' : '✓ User already exists');
    console.log(isCredentialMissing ? '✓ Credential created' : '✓ Credential already exists');
    for (const roleCode of DEFAULT_ADMIN.roles) {
      const isMappingMissing = missingRoleCodes.includes(roleCode);
      console.log(
        isMappingMissing
          ? `✓ ${roleCode} role assigned`
          : `✓ ${roleCode} role assignment already exists`
      );
    }

    console.log('Users Seeder Completed Successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error: any) {
    throw new Error(`Users Seeder Error: Database transaction failure. Details: ${error.message}`);
  }
}
