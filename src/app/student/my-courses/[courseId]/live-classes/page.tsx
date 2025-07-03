
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Clock, MonitorPlay } from 'lucide-react';
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

  const liveClasses = course.liveClasses?.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Live Classes</h1>
        <p className="mt-1 text-lg text-muted-foreground">Join upcoming live sessions for {course.title}.</p>
      </div>

      {liveClasses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveClasses.map((liveClass) => (
                  <Card key={liveClass.id} className="flex flex-col">
                      <CardHeader>
                          <Badge className={`${getPlatformBadgeColor(liveClass.platform)} text-white w-fit`}>
                              {liveClass.platform}
                          </Badge>
                          <CardTitle className="pt-2">{liveClass.topic}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                         <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/><span>{liveClass.date}</span></div>
                          <div className="flex items-center gap-2"><Clock className="h-4 w-4"/><span>{liveClass.time}</span></div>
                      </CardContent>
                      <CardFooter>
                         <Button asChild className="w-full">
                            <Link href={`/student/my-courses/${course.id}/live-classes/${liveClass.id}`}>
                              <Video className="mr-2 h-4 w-4" />
                              Join Class
                            </Link>
                          </Button>
                      </CardFooter>
                  </Card>
              ))}
          </div>
      ) : (
         <div className="text-center py-16 bg-muted rounded-lg">
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">There are no upcoming live classes scheduled for this course at the moment.</p>
        </div>
      )}
    </div>
  );
}
