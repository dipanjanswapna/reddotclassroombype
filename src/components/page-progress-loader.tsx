
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

/**
 * @fileOverview PageProgressLoader Component
 * Implements nprogress for smooth top-bar loading during route changes.
 * Custom styled to match RDC primary red theme.
 */
export function PageProgressLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({ 
      showSpinner: false, 
      speed: 500, 
      minimum: 0.3,
      easing: 'ease'
    });
  }, []);

  useEffect(() => {
    // Finish progress on route change detected
    NProgress.done();
    
    return () => {
      // Start progress on conceptual initiation
      NProgress.start();
    };
  }, [pathname, searchParams]);

  return (
    <style jsx global>{`
      #nprogress .bar {
        background: hsl(var(--primary)) !important;
        height: 3px !important;
        box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary));
        z-index: 10000 !important;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary)) !important;
      }
    `}</style>
  );
}
