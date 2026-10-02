import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.AUTH_SECRET;
// The app must refuse to start without it (min 32 chars)
if (!secret || secret.length < 32) {
  throw new Error('AUTH_SECRET environment variable is missing or less than 32 characters');
}
const encodedKey = new TextEncoder().encode(secret);

export type SessionPayload = {
  sub: string;
  role: string;
  name: string;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
