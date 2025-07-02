
'use client';

import { useEffect } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';
import { LiveClass } from '@/lib/types';


// Make sure FB object is available on window
declare global {
  interface Window {
    FB?: any;
  }
}

// IMPORTANT: Replace with your actual Facebook App ID
const FACEBOOK_APP_ID = 'YOUR_APP_ID';


const initializeFacebookSDK = () => {
  if (window.FB) {
    window.FB.XFBML.parse();
  }
};

const loadFacebookSDK = () => {
  if (FACEBOOK_APP_ID === 'YOUR_APP_ID') return;

  if (document.getElementById('facebook-jssdk')) {
    initializeFacebookSDK();
    return;
  }
  const script = document.createElement('script');
  script.id = 'facebook-jssdk';
  script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v20.0&appId=${FACEBOOK_APP_ID}&autoLogAppEvents=1`;
  script.async = true;
  script.defer = true;
  script.crossOrigin = 'anonymous';
  script.onload = initializeFacebookSDK;
  document.body.appendChild(script);
};

const YouTubePlayer = ({ url }: { url: string }) => {
  let videoId = '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else {
      videoId = urlObj.searchParams.get('v') || '';
    }
  } catch (error) {
    console.error("Invalid YouTube URL", error);
    return <p>Invalid YouTube URL provided.</p>
  }

  if (!videoId) return <p>Could not find YouTube video ID.</p>;
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  return (
    <iframe
      className="w-full h-full rounded-lg"
      src={embedUrl}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    ></iframe>
  );
};

const FacebookPlayer = ({ url }: { url:string }) => {
   useEffect(() => {
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.insertBefore(fbRoot, document.body.firstChild);
    }
    loadFacebookSDK();
  }, []);

  if (FACEBOOK_APP_ID === 'YOUR_APP_ID') {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-card p-4 rounded-lg">
            <Alert variant="destructive" className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200">
                <AlertTriangle className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Developer Notice: Configuration Required</AlertTitle>
                <AlertDescription>
                    The Facebook Live player is not fully configured. To make it work, you must replace <code>'YOUR_APP_ID'</code> with a real Facebook App ID in the <code>src/components/live-video-player.tsx</code> file.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div
      className="fb-video w-full"
      data-href={url}
      data-width="100%"
      data-show-text="false"
      data-autoplay="true"
    ></div>
  );
};


export const LiveVideoPlayer = ({ platform, url }: { platform: LiveClass['platform'], url: string }) => {
  switch (platform) {
    case 'YouTube Live':
      return <YouTubePlayer url={url} />;
    case 'Facebook Live':
      return <FacebookPlayer url={url} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted rounded-lg">
            <h3 className="font-headline text-2xl font-bold mb-2">Joining Live Class</h3>
            <p className="text-muted-foreground mb-4">This live class will be held on {platform}.</p>
            <Button asChild size="lg">
                <Link href={url} target="_blank" rel="noopener noreferrer">
                    Join on {platform}
                </Link>
            </Button>
        </div>
      );
  }
};
