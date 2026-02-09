
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course } from '@/lib/types';
import { ReviewsClient } from './reviews-client';

export default async function ReviewsPage({ params }: { params: { courseId: string } }) {
  const course = await getCourse(params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="mt-1 text-lg text-muted-foreground">See what other students are saying about {course.title}.</p>
      </div>

      <ReviewsClient course={course} />
    </div>
  );
}
