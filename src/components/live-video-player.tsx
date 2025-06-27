
'use client';

import { useEffect } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';

// Make sure FB object is available on window
declare global {
  interface Window {
    FB?: any;
  }
}

const initializeFacebookSDK = () => {
  if (window.FB) {
    window.FB.XFBML.parse();
  }
};

const loadFacebookSDK = () => {
  if (document.getElementById('facebook-jssdk')) {
    initializeFacebookSDK();
    return;
  }
  const script = document.createElement('script');
  script.id = 'facebook-jssdk';
  // IMPORTANT: Replace YOUR_APP_ID with a real Facebook App ID.
  script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v20.0&appId=YOUR_APP_ID&autoLogAppEvents=1`;
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

const FacebookPlayer = ({ url }: { url: string }) => {
   useEffect(() => {
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.insertBefore(fbRoot, document.body.firstChild);
    }
    loadFacebookSDK();
  }, []);

  return (
    <>
      <div className="mb-4 text-center p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-200 text-yellow-800 border border-yellow-200 dark:border-yellow-800 text-sm">
        <strong>Developer Note:</strong> To enable this player, you need to replace <code>'YOUR_APP_ID'</code> with a real Facebook App ID in the component source code.
      </div>
      <div
        className="fb-video"
        data-href={url}
        data-width="100%"
        data-show-text="false"
        data-autoplay="true"
      ></div>
    </>
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

    