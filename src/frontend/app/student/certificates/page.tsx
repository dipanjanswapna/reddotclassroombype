
import { Award, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { courses } from '@/lib/mock-data';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'My Certificates',
  description: 'Download your course completion certificates from Red Dot Classroom.',
};

const completedCourses = courses.slice(3, 5).map((course) => ({
    ...course,
    completedDate: '2024-05-15',
}));

export default function CertificatesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <Award className="w-10 h-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Certificates</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          You've worked hard! Here are the certificates you've earned.
        </p>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {completedCourses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
               <div className="relative aspect-[4/3] bg-muted rounded-md overflow-hidden mb-4">
                  <Image src="https://placehold.co/400x300.png" alt="Certificate thumbnail" data-ai-hint="certificate" fill className="object-cover" />
               </div>
               <CardTitle>{course.title}</CardTitle>
               <CardDescription>Completed on {course.completedDate}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <div className="p-6 pt-0">
                <Button className="w-full">
                    <Download className="mr-2" />
                    Download Certificate
                </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {completedCourses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">You haven't earned any certificates yet. Complete a course to get started!</p>
          </div>
      )}

    </div>
  );
}
