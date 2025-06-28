
'use client';

// This is a simplified pre-booking page. 
// It could have more complex logic, like partial payments.
// For now, it redirects to the main checkout page which handles pre-booking pricing.

import { useEffect } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function PreBookRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const site = params.site as string;
  
  const course = courses.find(c => c.id === courseId);

  useEffect(() => {
    if (course) {
        if (course.isPrebooking) {
            router.replace(`/sites/${site}/checkout/${courseId}`);
        } else {
            // If not a prebooking course, just go to the normal course page
            router.replace(`/sites/${site}/courses/${courseId}`);
        }
    }
  }, [course, courseId, router, site]);
  
  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Redirecting to checkout...</p>
    </div>
  );
}
