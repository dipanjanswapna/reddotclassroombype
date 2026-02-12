import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'bn'];
const defaultLocale = 'en';

// Dashboards and internal paths that should NOT have a locale prefix
const dashboardPrefixes = [
  '/admin',
  '/student',
  '/teacher',
  '/moderator',
  '/seller',
  '/affiliate',
  '/doubt-solver',
  '/api',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets and internal next paths
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return;
  }

  // 2. Skip Dashboard/Panel paths - No locale prefix for these
  const isDashboardPath = dashboardPrefixes.some(prefix => 
    pathname.startsWith(prefix)
  );

  if (isDashboardPath) {
    return;
  }

  // 3. Check if public path already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // 4. Redirect to default locale for public pages
  const locale = defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Optimized matcher to cover everything except specific ignored paths
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|signup.jpg|login.jpg).*)',
  ],
};
