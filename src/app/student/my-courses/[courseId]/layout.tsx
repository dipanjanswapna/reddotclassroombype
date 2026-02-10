
import React from 'react';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { CourseStudentNav } from '@/components/course-student-nav';

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) {
  const course = await getCourse(params.courseId);

  if (!course) {
    notFound();
  }
  
  return (
    <>
      <main className="flex-1 px-1 py-6 md:py-8 pb-32 overflow-x-hidden">
        <div className="container max-w-7xl mx-auto p-0">
            {children}
        </div>
      </main>
      <CourseStudentNav course={course} />
    </>
  );
}
