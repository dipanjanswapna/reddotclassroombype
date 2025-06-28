import { NextRequest, NextResponse } from 'next/server';
import { organizations } from '@/lib/mock-data';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'www.rdc.com';

  // NOTE: This is for local development. In production, you'd use your actual domain.
  const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';

  // Extract hostname and potential port
  const [currentHost, ] = hostname.split(':');

  if (!currentHost.endsWith(mainDomain)) {
    // If it's a completely different domain, do nothing.
     return NextResponse.next();
  }

  const subdomain = currentHost.endsWith(`.${mainDomain}`) 
    ? currentHost.replace(`.${mainDomain}`, '') 
    : null;

  if (subdomain && subdomain !== 'www') {
    const partner = organizations.find((org) => org.subdomain === subdomain);
    
    if (partner) {
      // Rewrite to the partner site route group
      const newPath = `/(sites)/${partner.subdomain}${url.pathname}`;
      return NextResponse.rewrite(new URL(newPath, req.url));
    }
  }

  return NextResponse.next();
}
