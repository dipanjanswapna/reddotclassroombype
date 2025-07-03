
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export default async function AnnouncementsPage({ params }: { params: { courseId: string } }) {
  const course = await getCourse(params.courseId);

  if (!course) {
    notFound();
  }

  const announcements = course.announcements || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Course Announcements</h1>
        <p className="mt-1 text-lg text-muted-foreground">Important updates from your instructor for {course.title}.</p>
      </div>

      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <Card key={ann.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle>{ann.title}</CardTitle>
                        <CardDescription>Posted on {ann.date}</CardDescription>
                    </div>
                    <Megaphone className="w-5 h-5 text-muted-foreground shrink-0"/>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-muted rounded-lg">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">There are no announcements for this course yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
