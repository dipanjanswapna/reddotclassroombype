import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { CourseContentClient } from '@/components/course-content-client';

/**
 * @fileOverview Student Course Homepage.
 * Updated for Next.js 15 async params compliance and elite portal rhythm.
 */
export default async function CourseHomePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-10 md:space-y-14">
      <div className="text-center sm:text-left space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase leading-tight">
          {course.title}
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Welcome back! Access your curriculum and track your progress.
        </p>
        <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
      </div>
      <CourseContentClient course={course} />
    </div>
  );
}
