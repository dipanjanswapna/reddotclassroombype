
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
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 overflow-x-hidden">
        <div className="container max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      <CourseStudentNav course={course} />
    </>
  );
}
