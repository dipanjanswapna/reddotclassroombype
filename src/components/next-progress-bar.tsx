'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

/**
 * @fileOverview NextProgressBar component.
 * Uses NProgress to show a slim loading bar at the top of the screen on route changes.
 * This provides immediate feedback to the user that the app is responding to their navigation.
 */
export function NextProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({ 
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.3
    });

    // Navigation has finished (or component mounted)
    NProgress.done();

    return () => {
      // Start progress bar on unmount (start of next navigation)
      NProgress.start();
    };
  }, [pathname, searchParams]);

  return null;
}
