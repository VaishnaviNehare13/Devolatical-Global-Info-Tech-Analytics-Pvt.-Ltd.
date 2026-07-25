import { PasswordHash, PasswordComparisonResult } from '../types/password.types';
import { hashPassword, comparePassword as comparePasswordHelper } from './password.helpers';

/**
 * Public Password Cryptographic API
 *
 * Serves as the unified entry point for password operations.
 * Delegates all cryptographic functions to password.helpers.ts.
 */

/**
 * Hashes a plain text password.
 *
 * @param password Plain text password
 * @returns A promise resolving to the PasswordHash
 * @throws {PasswordError} If hashing fails
 */
export async function createPasswordHash(password: string): Promise<PasswordHash> {
  return hashPassword(password);
}

/**
 * Compares a plain text password against a hash.
 *
 * @param password Plain text password
 * @param hash Hashed password to compare against
 * @returns A promise resolving to a boolean comparison result
 * @throws {PasswordError} If comparison fails
 */
export async function comparePassword(
  password: string,
  hash: PasswordHash
): Promise<PasswordComparisonResult> {
  return comparePasswordHelper(password, hash);
}
