import { verifySessionToken, type SessionPayload } from './session-utils';

export type { SessionPayload };
export { createSessionToken, verifySessionToken } from './session-utils';

export async function getSession() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSession(token: string) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
