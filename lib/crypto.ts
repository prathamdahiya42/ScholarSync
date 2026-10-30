import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Default fallback encryption key for local dev (32 bytes hex)
const DEV_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function getEncryptionKey(): Buffer {
  const secret = process.env.BANK_ENCRYPTION_KEY || DEV_KEY;
  return Buffer.from(secret.padEnd(64, '0').slice(0, 64), 'hex');
}

/**
 * Encrypt bank account number at rest
 */
export function encryptBankAccount(plainAccount: string): string {
  if (!plainAccount) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(plainAccount, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  // Return iv:tag:ciphertext
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt bank account number for authorized verification
 */
export function decryptBankAccount(cipherTextWithMeta: string): string {
  if (!cipherTextWithMeta) return '';
  try {
    const parts = cipherTextWithMeta.split(':');
    if (parts.length !== 3) return cipherTextWithMeta;
    
    const [ivHex, tagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt bank account:', err);
    return 'ENCRYPTED_ERROR';
  }
}

/**
 * Mask account number for UI and logs: e.g. "XXXXXXXX1234"
 */
export function maskBankAccount(accountNumber: string): string {
  if (!accountNumber) return '';
  const clean = accountNumber.replace(/\s+/g, '');
  if (clean.length <= 4) return 'XXXX' + clean;
  const last4 = clean.slice(-4);
  const maskedPrefix = 'X'.repeat(Math.max(4, clean.length - 4));
  return `${maskedPrefix}${last4}`;
}
