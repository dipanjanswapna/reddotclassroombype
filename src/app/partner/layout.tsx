
'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * @fileoverview This layout serves as a legacy redirector.
 * All routes under /partner/* are now permanently moved to /seller/*.
 * This component ensures any old bookmarks or links correctly redirect
 * to the new location, while showing a loader.
 */
export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith('/partner')) {
        const newPath = pathname.replace('/partner', '/seller');
        router.replace(newPath);
    }
  }, [pathname, router]);

  // Show a loading spinner while redirecting.
  // This layout should not be visible for more than a moment.
  return (
    <div className="flex items-center justify-center h-screen">
        <LoadingSpinner className="w-12 h-12" />
    </div>
  );
}
