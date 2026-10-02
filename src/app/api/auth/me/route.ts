import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { store } from '@/lib/auth/store';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }
  
  return NextResponse.json({
    id: session.sub,
    name: session.name,
    email: session.email,
    role: session.role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.name)}`
  });
}
