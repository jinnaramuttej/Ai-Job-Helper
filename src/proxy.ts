import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session-utils';

const studentRoutes = ['/jobs', '/recommended', '/saved', '/applications', '/resume', '/profile'];

export default async function proxy(req: NextRequest) {
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

  const isAdminLogin = pathname === '/admin/login';

  // Admin routing logic
  if (isAdminRoute) {
    if (isAdminLogin) {
      if (session?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/jobs', req.url));
      }
      return NextResponse.next();
    }
    
    // Protected admin routes
    if (!session || session.role !== 'admin') {
      const nextUrl = new URL('/admin/login', req.url);
      nextUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(nextUrl);
    }
    return NextResponse.next();
  }

  // Student routing logic
  if (isAuthRoute) {
    if (session?.role === 'student') {
      return NextResponse.redirect(new URL('/jobs', req.url));
    }
    // If admin is on student login page, redirect them to admin jobs
    if (session?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/jobs', req.url));
    }
    return NextResponse.next();
  }

  if (isStudentRoute) {
    if (!session || session.role !== 'student') {
      const nextUrl = new URL('/login', req.url);
      nextUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(nextUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
