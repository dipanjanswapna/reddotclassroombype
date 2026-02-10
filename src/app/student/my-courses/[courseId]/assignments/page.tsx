
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignmentsClient } from './assignments-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ClipboardEdit } from 'lucide-react';

export default async function AssignmentsPage({ params }: { params: { courseId: string } }) {
  const course = await getCourse(params.courseId);
  
  if (!course) {
    notFound();
  }
  
  const initialAssignments = course.assignments || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2 border-l-4 border-primary pl-4">
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Homework & <span className="text-primary">Assignments</span></h1>
        <p className="text-muted-foreground font-medium">Submit your assignments and get professional feedback for {course.title}.</p>
      </div>

      <Card className="rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
                <ClipboardEdit className="w-6 h-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Assignment Tracker</CardTitle>
                <CardDescription className="font-medium text-xs">Keep track of your academic tasks and deadlines.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner className="w-10 h-10" /></div>}>
            <AssignmentsClient course={course} initialAssignments={initialAssignments} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
