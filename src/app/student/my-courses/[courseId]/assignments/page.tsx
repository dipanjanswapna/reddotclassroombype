import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignmentsClient } from './assignments-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * @fileOverview Course Assignments Page.
 * Updated for Next.js 15 async params compliance and refined visual rhythm.
 */
export default async function AssignmentsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  
  if (!course) {
    notFound();
  }
  
  const initialAssignments = course.assignments || [];

  return (
    <div className="space-y-10 md:space-y-14">
      <div className="text-center sm:text-left space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Learning Tasks</h1>
        <p className="text-lg text-muted-foreground font-medium">Submit and review assignments for {course.title}.</p>
        <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
      </div>
      <Card className="rounded-2xl border-primary/10 shadow-xl overflow-hidden bg-card">
        <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
          <CardTitle className="font-black uppercase tracking-tight text-lg">Your Submission Queue</CardTitle>
          <CardDescription className="font-medium">Stay on track by monitoring upcoming and graded milestones.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<div className="flex justify-center items-center h-48"><LoadingSpinner /></div>}>
            <AssignmentsClient course={course} initialAssignments={initialAssignments} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
