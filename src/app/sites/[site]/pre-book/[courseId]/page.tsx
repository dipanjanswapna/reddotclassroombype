
'use client';

// This is a simplified pre-booking page. 
// It could have more complex logic, like partial payments.
// For now, it redirects to the main checkout page which handles pre-booking pricing.

import { useEffect, useState } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function PreBookRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const site = params.site as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchAndRedirect = async () => {
        try {
            const courseData = await getCourse(courseId);
            if (courseData) {
                setCourse(courseData);
                if (courseData.isPrebooking) {
                    router.replace(`/sites/${site}/checkout/${courseId}`);
                } else {
                    router.replace(`/sites/${site}/courses/${courseId}`);
                }
            } else {
                setLoading(false);
                notFound();
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            notFound();
        }
    };

    fetchAndRedirect();
  }, [courseId, router, site]);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <LoadingSpinner />
            <p className="text-muted-foreground">Loading course information...</p>
        </div>
      );
  }

  // This part will likely not be visible due to the quick redirect,
  // but it's good practice for handling the state.
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
