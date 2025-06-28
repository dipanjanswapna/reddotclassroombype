import { NextRequest, NextResponse } from 'next/server';

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

// This middleware is now a pass-through.
// The path-based multi-tenancy is handled by the file system routing (`/sites/[site]`).
// This file is kept to avoid breaking changes if it was previously used,
// but it no longer contains active logic.
export default async function middleware(req: NextRequest) {
  return NextResponse.next();
}
