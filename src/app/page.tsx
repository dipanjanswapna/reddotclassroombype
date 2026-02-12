'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * @fileOverview Root Redirect Page
 * Simply shows a loader while middleware redirects to /[locale]
 */
export default function RootPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
      setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <LoadingSpinner className="w-16 h-16" />
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-primary animate-pulse"
        >
            Preparing Classroom...
        </motion.p>
    </div>
  );
}
