
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import type { Course } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

function getPlatformBadgeColor(platform: string) {
    switch (platform.toLowerCase()) {
        case 'youtube live':
            return 'bg-red-600 hover:bg-red-700';
        case 'facebook live':
            return 'bg-blue-600 hover:bg-blue-700';
        case 'zoom':
            return 'bg-sky-500 hover:bg-sky-600';
        case 'google meet':
            return 'bg-green-600 hover:bg-green-700';
        default:
            return 'bg-gray-500 hover:bg-gray-600';
    }
}

export default function LiveClassesPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        const data = await getCourse(courseId);
        setCourse(data);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
          <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }
  
  if (!course) {
    notFound();
  }

  const liveClasses = course.liveClasses || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Live Classes</h1>
        <p className="mt-1 text-lg text-muted-foreground">Join upcoming live sessions for {course.title}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Live Class Schedule</CardTitle>
          <CardDescription>Don't miss out on these interactive sessions with your instructors.</CardDescription>
        </CardHeader>
        <CardContent>
          {liveClasses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveClasses.map((liveClass) => (
                  <TableRow key={liveClass.id}>
                    <TableCell className="font-medium">{liveClass.topic}</TableCell>
                    <TableCell>{liveClass.date} at {liveClass.time}</TableCell>
                    <TableCell>
                        <Badge className={`${getPlatformBadgeColor(liveClass.platform)} text-white`}>
                            {liveClass.platform}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild>
                        <Link href={`/student/my-courses/${course.id}/live-classes/${liveClass.id}`}>
                          <Video className="mr-2" />
                          Join Class
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-8 text-muted-foreground">
                <p>There are no upcoming live classes scheduled for this course at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
