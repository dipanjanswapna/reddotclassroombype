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
        <div className="mb-4 text-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 dark:text-blue-200 text-blue-800 border border-blue-200 dark:border-blue-800 text-sm">
            <strong>Action Required:</strong> The Facebook Comments plugin is not fully configured. To make it work, you must replace <code>'YOUR_APP_ID'</code> with a real Facebook App ID in this component's source code.
        </div>
        <div className="fb-comments" data-href={href} data-width="100%" data-numposts="5"></div>
    </>
  );
};

export default FacebookComments;
