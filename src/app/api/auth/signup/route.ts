import { NextResponse } from 'next/server';
import { store } from '@/lib/auth/store';
import { createSessionToken, setSession } from '@/lib/auth/session';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password must be at most 72 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { name, email, password } = result.data;
    
    const existing = await store.findByEmail(email);
    if (existing) {
      return NextResponse.json({ errors: { email: ['Email already exists'] } }, { status: 400 });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await store.create({
      email,
      name,
      passwordHash,
      role: 'student'
    });
    
    const token = await createSessionToken({ sub: user.id, role: user.role, name: user.name });
    await setSession(token);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error details:", error);
    if (error instanceof Error && error.message === 'Email already exists') {
      return NextResponse.json({ errors: { email: ['Email already exists'] } }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
