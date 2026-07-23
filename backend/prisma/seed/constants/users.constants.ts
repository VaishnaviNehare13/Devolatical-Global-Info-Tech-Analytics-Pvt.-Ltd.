import { UserStatus } from '@prisma/client';
import { ROLE_CODES } from './roles.constants';

/**
 * Default User Constants
 * 
 * Defines the initial bootstrap profile and security configurations
 * for the root Super Admin account.
 */

export const DEFAULT_ADMIN = {
  firstName: 'Super',
  lastName: 'Admin',
  displayName: 'Super Admin',
  email: 'admin@devolatical.com',
  password: 'ChangeMe@123', // Read-only plaintext seed password. To be hashed during user seeding.
  emailVerified: true,
  status: UserStatus.ACTIVE,
  roles: [
    ROLE_CODES.SUPER_ADMIN,
  ],
};
