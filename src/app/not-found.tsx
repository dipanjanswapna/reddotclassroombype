'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

export default function NotFound() {
  
  useEffect(() => {
    // This effect adds a class to the body to hide the main header and footer.
    // It runs on the client-side after initial hydration.
    document.body.classList.add('body-is-404');
    
    // Cleanup function to remove the class when the component unmounts.
    return () => {
      document.body.classList.remove('body-is-404');
    };
  }, []);

  return (
    // This div is fixed to cover the entire viewport and prevents any scrolling.
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-xl text-center">
        <Image
          src="/404error.png"
          alt="Confused character with a 404 error"
          width={600}
          height={400}
          className="w-full max-w-md h-auto mx-auto mb-8"
        />
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
