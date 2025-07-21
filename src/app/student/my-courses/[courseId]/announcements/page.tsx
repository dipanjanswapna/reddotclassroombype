
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCourse, markAllAnnouncementsAsRead } from '@/lib/firebase/firestore';
import type { Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

export default function AnnouncementsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { userInfo } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourseData() {
        if (!courseId) return;
        try {
            const courseData = await getCourse(courseId);
            setCourse(courseData);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchCourseData();
  }, [courseId]);

  const handleMarkAsRead = async () => {
    if (!userInfo || !course) return;
    try {
        await markAllAnnouncementsAsRead(userInfo.uid, course.id!);
        toast({ title: 'Success', description: 'All announcements marked as read.' });
        // Optionally, update the UI state to reflect this change immediately
    } catch(e) {
        toast({ title: 'Error', description: 'Could not mark announcements as read.', variant: 'destructive'});
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>;
  }
  
  if (!course) {
    notFound();
  }

  const announcements = course.announcements || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Course Announcements</h1>
            <p className="mt-1 text-lg text-muted-foreground">Important updates for {course.title}.</p>
        </div>
        <Button onClick={handleMarkAsRead} variant="outline" size="sm">
            <CheckCheck className="mr-2 h-4 w-4"/>
            Mark All as Read
        </Button>
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
