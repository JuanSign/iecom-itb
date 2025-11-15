import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if(!process.env.SESSION_SECRET)
    throw new Error('SESSION_SECRET environment variable is not set');
const SECRET_KEY = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(SECRET_KEY);

const protectedRoutes = ['/dashboard'];
const authRoutes = ['/register', '/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('session')?.value;

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  let isValidSession = false;
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] });
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  if (isProtectedRoute && !isValidSession) {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  if (isAuthRoute && isValidSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const allowedPaths = ['/register', '/dashboard'];
  const isAllowedPath = allowedPaths.some((route) => path.startsWith(route));

  if (!isAllowedPath) {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};