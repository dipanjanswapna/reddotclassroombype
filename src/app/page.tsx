'use client';

import React from 'react';
import { getHomepageConfig, getCoursesByIds, getInstructors, getOrganizations, getUsers, getEnrollments, getCourses } from '@/lib/firebase/firestore';
import type { HomepageConfig, Course, Instructor, Organization } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/loading-spinner';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Skeleton Loading UI for Home Page
 */
function HomeSkeleton() {
    return (
        <div className="px-1 space-y-8 md:space-y-12 animate-pulse py-20">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner className="w-12 h-12" />
                <Skeleton className="h-10 w-3/4 mx-auto max-w-lg rounded-xl" />
                <Skeleton className="h-4 w-1/2 mx-auto max-w-md rounded-lg" />
            </div>
        </div>
    );
}

/**
 * @fileOverview Root Redirect Page
 * Simply shows a loader while middleware redirects to /[locale]
 */
export default function RootPage() {
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
      // Middleware handles the heavy lifting, this is just a fail-safe
      setLoading(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
