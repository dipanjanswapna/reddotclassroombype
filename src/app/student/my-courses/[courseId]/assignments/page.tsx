
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignmentsClient } from './assignments-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

export default async function AssignmentsPage({ params }: { params: { courseId: string } }) {
  const course = await getCourse(params.courseId);
  
  if (!course) {
    notFound();
  }
  
  // The client component will handle filtering assignments for the logged-in user.
  const initialAssignments = course.assignments || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="mt-1 text-lg text-muted-foreground">Submit your assignments for {course.title}.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
          <CardDescription>Keep track of your assignments and deadlines.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex justify-center items-center h-48"><LoadingSpinner /></div>}>
            <AssignmentsClient course={course} initialAssignments={initialAssignments} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
