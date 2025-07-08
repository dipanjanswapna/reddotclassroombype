
'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

export default function NotFound() {
  
  useEffect(() => {
    // This effect runs on the client after hydration.
    // It adds a class to the body to hide the main header and footer.
    document.body.classList.add('body-is-404');
    
    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove('body-is-404');
    };
  }, []);

  return (
    // Main container fills the screen and prevents overflow
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text content section */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="font-semibold text-muted-foreground">ERROR CODE: 404</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              OOOPS!!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              This is not the page you are looking for.
            </p>
            <div className="mt-10">
              <p className="text-muted-foreground">Here are some helpful links instead:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 lg:justify-start">
                <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline">Home</a>
                <a href="/courses" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline">Courses</a>
                <a href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline">Contact</a>
              </div>
            </div>
          </div>
          
          {/* Image section */}
          <div className="relative h-80 w-full sm:h-96">
            <Image
              src="/404error.png"
              alt="Confused character looking at a 404 error"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
