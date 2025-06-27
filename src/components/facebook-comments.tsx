'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    FB?: any;
  }
}

const FacebookComments = ({ href }: { href: string }) => {
  useEffect(() => {
    const initializeFacebookSDK = () => {
      if (window.FB) {
        window.FB.XFBML.parse();
      }
    };
    
    if (document.getElementById('facebook-jssdk')) {
      initializeFacebookSDK();
      return;
    }

    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.insertBefore(fbRoot, document.body.firstChild);
    }
    
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v20.0&appId=YOUR_APP_ID&autoLogAppEvents=1`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = initializeFacebookSDK;

    document.body.appendChild(script);

  }, [href]);

  return (
    <>
        <div className="mb-4 text-center p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-200 text-yellow-800 border border-yellow-200 dark:border-yellow-800 text-sm">
            <strong>Developer Note:</strong> To enable comment moderation and analytics, you need to replace <code>'YOUR_APP_ID'</code> with a real Facebook App ID in the component source code.
        </div>
        <div className="fb-comments" data-href={href} data-width="100%" data-numposts="5"></div>
    </>
  );
};

export default FacebookComments;
