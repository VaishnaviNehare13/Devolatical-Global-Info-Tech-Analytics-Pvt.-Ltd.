import bcrypt from 'bcrypt';
import { config } from '../../config';
import { PasswordHash, PasswordComparisonResult, PasswordError } from '../types/password.types';

/**
 * Low-level Password Cryptographic Helpers
 *
 * This file is the ONLY component authorized to communicate directly with the bcrypt library.
 * It encapsulates bcrypt errors and exposes domain-specific errors.
 */

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param password The plain text password to hash
 * @returns A promise resolving to the hashed password
 * @throws {PasswordError} If hashing fails or configuration is invalid
 */
export async function hashPassword(password: string): Promise<PasswordHash> {
  try {
    const saltRounds = config.security.bcryptSaltRounds;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new PasswordError('PASSWORD_HASH_FAILED', 'Failed to generate password hash.', error);
  }
}

/**
 * Compares a plain text password with a hashed password using bcrypt.
 *
 * @param password The plain text password
 * @param hash The hashed password to compare against
 * @returns A promise resolving to the comparison result boolean
 * @throws {PasswordError} If comparison fails
 */
export async function comparePassword(
  password: string,
  hash: PasswordHash
): Promise<PasswordComparisonResult> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new PasswordError('PASSWORD_COMPARE_FAILED', 'Failed to verify password.', error);
  }
}
