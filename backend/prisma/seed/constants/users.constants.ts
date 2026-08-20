import { UserStatus } from '@prisma/client';
import { ROLE_CODES } from './roles.constants';

/**
 * Bootstrap User Configuration Interface
 */
export interface SeedUserConfig {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
  emailVerified: boolean;
  status: UserStatus;
  roles: string[];
}

/**
 * Default Super Admin Constants
 *
 * Defines the initial bootstrap profile and security configurations
 * for the root Super Admin account.
 * Note: This credential is for bootstrap/development purposes and should be secured for production.
 */
export const DEFAULT_ADMIN: SeedUserConfig = {
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

/**
 * Default Employee Constants (Development / Bootstrap Testing)
 *
 * Standard employee user account for verifying role-based access control,
 * employee login flow, and portal dashboard accessibility.
 * Note: This credential is for development/test purposes and should be changed or removed in production.
 */
export const DEFAULT_EMPLOYEE: SeedUserConfig = {
  firstName: 'Employee',
  lastName: 'User',
  displayName: 'Employee User',
  email: 'employee@devolatical.com',
  password: 'Employee@123', // Read-only plaintext seed password. To be hashed during user seeding.
  emailVerified: true,
  status: UserStatus.ACTIVE,
  roles: [
    ROLE_CODES.EMPLOYEE,
  ],
};

export const DEFAULT_CLIENT: SeedUserConfig = {
  firstName: 'Acme',
  lastName: 'Client',
  displayName: 'Acme Corp Client',
  email: 'client@devolatical.com',
  password: 'Client@123',
  emailVerified: true,
  status: UserStatus.ACTIVE,
  roles: [
    ROLE_CODES.CLIENT,
  ],
};

/**
 * List of all bootstrap users to seed into the database
 */
export const SEED_USERS: SeedUserConfig[] = [
  DEFAULT_ADMIN,
  DEFAULT_EMPLOYEE,
  DEFAULT_CLIENT,
];

