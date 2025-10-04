import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set<string>(['/login', '/register']);
const PUBLIC_PREFIXES = ['/api', '/_next', '/auth', '/static', '/favicon', '/robots', '/manifest'];
const SESSION_COOKIE_NAMES = ['__Secure-better-auth.session_token', 'better-auth.session_token'];

const isPublicPath = (pathname: string) => {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const hasSessionCookie = (request: NextRequest) => {
  return SESSION_COOKIE_NAMES.some((cookieName) => request.cookies.has(cookieName));
};

const buildRedirectUrl = (request: NextRequest) => {
  const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL('/login', request.url);

  if (redirectTarget && redirectTarget !== '/login') {
    loginUrl.searchParams.set('redirect', redirectTarget);
  }

  return loginUrl;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || hasSessionCookie(request)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(buildRedirectUrl(request));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
