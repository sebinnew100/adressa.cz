import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';

export function getExpectedToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  return crypto.createHash('sha256').update(password + 'adresar_admin_salt').digest('hex');
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  return cookieValue === getExpectedToken();
}

export { COOKIE_NAME };
