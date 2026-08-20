import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SEED_USERS, ROLE_CODES } from './constants';

/**
 * Users Seeder Module
 *
 * Responsible for seeding initial bootstrap users (Super Administrator, Employee),
 * creating their security credentials, and mapping their security roles.
 * Supports self-healing, multi-role bootstrapping, and runs write operations
 * atomically inside a transaction per user.
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
  if (!SEED_USERS || !Array.isArray(SEED_USERS) || SEED_USERS.length === 0) {
    throw new Error('Users Seeder Error: SEED_USERS constant is missing or empty in configurations.');
  }
  if (!ROLE_CODES) {
    throw new Error('Users Seeder Error: ROLE_CODES constant is missing in configurations.');
  }

  // 2. Validate and retrieve all necessary roles from the database
  const requiredRoleCodes = Array.from(new Set(SEED_USERS.flatMap((user) => user.roles)));
  const rolesMap = new Map<string, { id: string; name: string; code: string }>();

  for (const roleCode of requiredRoleCodes) {
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

  // ==========================================
  // PHASE 2: IDEMPOTENT USER SEEDING
  // ==========================================
  for (const userConfig of SEED_USERS) {
    if (!userConfig.roles || !Array.isArray(userConfig.roles) || userConfig.roles.length === 0) {
      throw new Error(`Users Seeder Error: User "${userConfig.email}" roles must be a non-empty array.`);
    }

    // 3. Query existing user and their credential
    const existingUser = await prisma.user.findUnique({
      where: { email: userConfig.email },
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
    for (const roleCode of userConfig.roles) {
      const role = rolesMap.get(roleCode)!;
      const hasMapping = existingUserRoles.some((ur) => ur.roleId === role.id);
      if (isUserMissing || !hasMapping) {
        missingRoleCodes.push(roleCode);
      }
    }

    // 5. Generate bcrypt hash (12 salt rounds) outside the transaction if needed
    const needsPasswordHash = isCredentialMissing;
    let passwordHash = '';

    if (needsPasswordHash) {
      try {
        const saltRounds = 12;
        passwordHash = await bcrypt.hash(userConfig.password, saltRounds);
      } catch (err: any) {
        throw new Error(`Users Seeder Error: Failed to hash password for ${userConfig.email}. Details: ${err.message}`);
      }
    }

    // 6. Database transaction (Writes only)
    const hasWrites = isUserMissing || isCredentialMissing || missingRoleCodes.length > 0;

    try {
      if (hasWrites) {
        await prisma.$transaction(async (tx) => {
          let userId = existingUser?.id;

          // Write 1: Create User if missing
          if (isUserMissing) {
            const createdUser = await tx.user.create({
              data: {
                firstName: userConfig.firstName,
                lastName: userConfig.lastName,
                displayName: userConfig.displayName,
                email: userConfig.email,
                emailVerified: userConfig.emailVerified,
                status: userConfig.status,
              },
              select: { id: true },
            });
            userId = createdUser.id;
          }

          // Write 2: Create Credential if missing
          if (isCredentialMissing) {
            if (!userId) {
              throw new Error(`Users Seeder Error: Cannot create credential without a valid userId for ${userConfig.email}.`);
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
              throw new Error(`Users Seeder Error: Cannot assign role "${roleCode}" without a valid userId for ${userConfig.email}.`);
            }

            await tx.userRole.upsert({
              where: {
                userId_roleId: {
                  userId: userId,
                  roleId: role.id,
                },
              },
              update: {
                isActive: true,
              },
              create: {
                userId: userId,
                roleId: role.id,
                isActive: true,
              },
            });
          }
        });
      }

      // Logging status for this user
      console.log(`[${userConfig.email}]`);
      console.log(isUserMissing ? '  ✓ User created' : '  ✓ User already exists');
      console.log(isCredentialMissing ? '  ✓ Credential created' : '  ✓ Credential already exists');
      for (const roleCode of userConfig.roles) {
        const isMappingMissing = missingRoleCodes.includes(roleCode);
        console.log(
          isMappingMissing
            ? `  ✓ ${roleCode} role assigned`
            : `  ✓ ${roleCode} role assignment already exists`
        );
      }
    } catch (error: any) {
      throw new Error(`Users Seeder Error: Database transaction failure for ${userConfig.email}. Details: ${error.message}`);
    }
  }

  console.log('Users Seeder Completed Successfully');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
