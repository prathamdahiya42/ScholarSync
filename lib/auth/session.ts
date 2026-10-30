import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'myscholar_session';
const SECRET = process.env.SESSION_SECRET || 'dev-session-secret-key-32-chars-minimum!';

export interface SessionData {
  role: 'student' | 'management_reviewer' | 'admin';
  studentId?: string;
  userId?: string;
  name: string;
  identifier: string; // mobile for student, email for staff
}

/**
 * Encrypt and sign session payload into cookie value
 */
export function signSession(data: SessionData): string {
  const payload = JSON.stringify({ ...data, ts: Date.now() });
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', crypto.scryptSync(SECRET, 'salt', 32), iv);
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted}`;
}

/**
 * Decrypt session cookie value
 */
export function verifySession(cookieValue?: string): SessionData | null {
  if (!cookieValue) return null;
  try {
    const [ivHex, tagHex, encrypted] = cookieValue.split('.');
    if (!ivHex || !tagHex || !encrypted) return null;

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.scryptSync(SECRET, 'salt', 32), iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted) as SessionData;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to get current session from Next.js server context
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySession(sessionCookie);
}

/**
 * Helper to set session cookie
 */
export async function setSessionCookie(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const token = signSession(data);
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

/**
 * Helper to clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
