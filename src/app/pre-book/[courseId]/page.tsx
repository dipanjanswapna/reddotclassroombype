
'use client';

// This is a simplified pre-booking page. 
// It could have more complex logic, like partial payments.
// For now, it redirects to the main checkout page which handles pre-booking pricing.

import { useEffect } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { Loader2 } from 'lucide-react';

export default function PreBookRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const course = courses.find(c => c.id === courseId);

  useEffect(() => {
    if (course) {
        if (course.isPrebooking) {
            router.replace(`/checkout/${courseId}`);
        } else {
            // If not a prebooking course, just go to the normal course page
            router.replace(`/courses/${courseId}`);
        }
    }
  }, [course, courseId, router]);
  
  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to checkout...</p>
    </div>
  );
}

