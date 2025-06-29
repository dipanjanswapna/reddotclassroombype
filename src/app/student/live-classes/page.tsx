
'use client';

import { useState, useEffect } from 'react';
import { getCourses } from '@/lib/firebase/firestore';
import { LiveClass as LiveClassType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';

type LiveClassWithCourse = LiveClassType & {
  courseTitle: string;
  courseId: string;
};

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

export default function AllLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClassWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveClasses() {
      try {
        // In a real app, this would be fetched based on the logged-in user.
        // For now, we'll mock the student's enrolled courses.
        const enrolledCourseIds = ['1', '3', '4'];
        
        const allCourses = await getCourses();

        const studentLiveClasses = allCourses
          .filter(course => course.id && enrolledCourseIds.includes(course.id))
          .flatMap(course => 
              (course.liveClasses || []).map(liveClass => ({
                ...liveClass,
                courseId: course.id!,
                courseTitle: course.title,
              }))
          )
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setLiveClasses(studentLiveClasses);
      } catch (error) {
        console.error("Failed to fetch live classes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveClasses();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Upcoming Live Classes</h1>
        <p className="mt-1 text-lg text-muted-foreground">Stay on top of your live class schedule across all your courses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
          <CardDescription>This list includes upcoming live classes from all the courses you are currently enrolled in.</CardDescription>
        </CardHeader>
        <CardContent>
          {liveClasses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveClasses.map((liveClass) => (
                  <TableRow key={`${liveClass.courseId}-${liveClass.id}`}>
                    <TableCell className="font-medium">{liveClass.courseTitle}</TableCell>
                    <TableCell>{liveClass.topic}</TableCell>
                    <TableCell>
                        <Badge className={`${getPlatformBadgeColor(liveClass.platform)} text-white`}>
                            {liveClass.platform}
                        </Badge>
                    </TableCell>
                    <TableCell>{liveClass.date} at {liveClass.time}</TableCell>
                    <TableCell className="text-right">
                       <Button asChild>
                        <Link href={`/student/my-courses/${liveClass.courseId}/live-classes/${liveClass.id}`}>
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
             <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <Video className="w-12 h-12 mb-4 text-gray-400" />
                <p>You have no upcoming live classes scheduled.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
