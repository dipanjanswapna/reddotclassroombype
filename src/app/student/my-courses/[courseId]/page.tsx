
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { CourseContentClient } from '@/components/course-content-client';

export default async function CourseHomePage({ params }: { params: { courseId: string } }) {
  const course = await getCourse(params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {course.title}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Welcome back! Let's continue where you left off.
        </p>
      </div>
      <CourseContentClient course={course} />
    </div>
  );
}
