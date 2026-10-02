import { NextResponse } from 'next/server';
import { store } from '@/lib/auth/store';
import { createSessionToken, setSession } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { email, password } = result.data;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${email.toLowerCase()}:${ip}`;
    
    const { allowed, retryAfter } = checkRateLimit(rateLimitKey);
    if (!allowed) {
      return NextResponse.json({ error: `Too many attempts. Try again in ${retryAfter} seconds.` }, {
        status: 429,
        headers: { 'Retry-After': retryAfter.toString() }
      });
    }
    
    const user = await store.findByEmail(email);
    const invalidMessage = 'Invalid email or password';
    
    if (!user) {
      return NextResponse.json({ error: invalidMessage }, { status: 401 });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: invalidMessage }, { status: 401 });
    }
    
    const token = await createSessionToken({ sub: user.id, role: user.role, name: user.name, email: user.email });
    await setSession(token);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
