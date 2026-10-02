import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';

const studentRoutes = ['/jobs', '/recommended', '/saved', '/applications', '/resume', '/profile'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const isStudentRoute = studentRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  
  if (!isStudentRoute && !isAdminRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get('session')?.value;
  let session = null;
  if (token) {
    session = await verifySessionToken(token);
  }

  if (isAuthRoute) {
    if (session) {
      return NextResponse.redirect(new URL('/jobs', req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const nextUrl = new URL('/login', req.url);
    nextUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(nextUrl);
  }

  if (isAdminRoute && session.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
