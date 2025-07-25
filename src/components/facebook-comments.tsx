

'use client';

import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';
import { FACEBOOK_APP_ID } from '@/lib/fpixel';

declare global {
  interface Window {
    FB?: any;
  }
}

const FacebookComments = ({ href }: { href: string }) => {
  useEffect(() => {
    if (FACEBOOK_APP_ID === 'YOUR_APP_ID') return;

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
    script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v20.0&appId=${FACEBOOK_APP_ID}&autoLogAppEvents=1`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = initializeFacebookSDK;

    document.body.appendChild(script);

  }, [href]);

  if (FACEBOOK_APP_ID === 'YOUR_APP_ID') {
    return (
      <Alert variant="destructive" className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200">
        <AlertTriangle className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Developer Notice: Configuration Required</AlertTitle>
        <AlertDescription>
          The Facebook Comments plugin is not fully configured. To make it work, you must replace `YOUR_APP_ID` with a real Facebook App ID in your <code>.env</code> file.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="fb-comments" data-href={href} data-width="100%" data-numposts="5"></div>
  );
};

export default FacebookComments;
