
'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { FACEBOOK_PIXEL_ID } from '@/lib/fpixel';
import * as pixel from '@/lib/fpixel';

const FacebookPixel = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (FACEBOOK_PIXEL_ID) {
      pixel.pageview();
    }
  }, [pathname, searchParams]);

  if (!FACEBOOK_PIXEL_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FACEBOOK_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
};


// The Suspense boundary is needed because `usePathname` and `useSearchParams`
// will suspend the component during initial render.
const FacebookPixelWithSuspense = () => (
    <Suspense fallback={null}>
        <FacebookPixel />
    </Suspense>
);

export default FacebookPixelWithSuspense;
