
'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
// Importing the image directly makes it a part of the build process.
// This is the most reliable way to ensure the image is always available.
// The path assumes '404error.png' is inside a 'public' folder, which is inside the 'src' folder.
import errorImage from '../public/404error.png';

export default function NotFound() {
  
  useEffect(() => {
    // This effect adds a class to the body to hide the main header and footer.
    document.body.classList.add('body-is-404');
    
    // Cleanup function to remove the class when the component unmounts.
    return () => {
      document.body.classList.remove('body-is-404');
    };
  }, []);

  return (
    // This div is fixed to cover the entire viewport and prevents any scrolling.
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-xl text-center flex flex-col items-center">
        
        {/* Using a relative container for the fill image */}
        <div className="relative w-full max-w-md h-64 mb-8">
            <Image
                src={errorImage}
                alt="Confused character with a 404 error"
                fill
                className="object-contain"
                priority // Load this image first as it's critical for the page
            />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          OOOPS!!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          This is not the page you are looking for.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline">
            Go back home
          </a>
          <a href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
