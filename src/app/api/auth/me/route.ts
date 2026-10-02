import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { store } from '@/lib/auth/store';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }
  
  const user = await store.findById(session.sub);
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }
  
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
  });
}
