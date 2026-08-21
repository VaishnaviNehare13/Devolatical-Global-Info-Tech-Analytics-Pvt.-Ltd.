import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from '../../../config';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Derives a 32-byte Encryption Key from application secret.
 */
function getEncryptionKey(): Buffer {
  const secretKey = config.jwt.accessSecret;
  if (!secretKey) {
    throw new Error('MFA encryption failed: JWT access secret is not configured.');
  }
  return crypto.createHash('sha256').update(secretKey).digest();
}

/**
 * Encrypts sensitive string (e.g. TOTP secret) using AES-256-GCM.
 */
export function encryptSecret(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts sensitive string using AES-256-GCM.
 */
export function decryptSecret(cipherText: string): string {
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }

    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    throw new Error('Failed to decrypt TOTP secret.');
  }
}

export interface TotpSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
}

/**
 * Generates new TOTP setup credentials for an account email.
 */
export async function generateTotpSetup(email: string): Promise<TotpSetupResult> {
  const secretObj = speakeasy.generateSecret({
    name: `Devolatical Global Info-Tech (${email})`,
    issuer: 'Devolatical Global Info-Tech',
    length: 20,
  });

  const secret = secretObj.base32;
  const otpauthUrl =
    secretObj.otpauth_url ||
    `otpauth://totp/Devolatical%20Global%20Info-Tech:${encodeURIComponent(email)}?secret=${secret}&issuer=Devolatical%20Global%20Info-Tech`;
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret,
    otpauthUrl,
    qrCodeUrl,
  };
}

/**
 * Generates current 6-digit TOTP code for a secret (useful for testing/verification).
 */
export function generateTotpCode(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
}

/**
 * Verifies a 6-digit TOTP token against a plain (decrypted) TOTP secret.
 */
export function verifyTotpToken(code: string, plainSecret: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const cleanCode = code.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) return false;

  try {
    return speakeasy.totp.verify({
      secret: plainSecret,
      encoding: 'base32',
      token: cleanCode,
      window: 1,
    });
  } catch {
    return false;
  }
}
