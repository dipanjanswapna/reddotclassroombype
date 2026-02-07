'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

/**
 * @fileOverview NextProgressBar component.
 * Uses NProgress to show a slim loading bar at the top of the screen on route changes.
 */
export function NextProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This is called when the route starts changing or when the component mounts
    // In App Router, route changes are often fast enough that we don't catch the "start"
    // but the effect runs when the pathname/searchParams update, signifying completion.
    NProgress.done();

    return () => {
      NProgress.start();
    };
  }, [pathname, searchParams]);

  return null;
}
