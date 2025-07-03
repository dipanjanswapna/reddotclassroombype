
'use client';

import { useState, useEffect } from 'react';
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { LiveClass as LiveClassType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Clock, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';

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
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [liveClasses, setLiveClasses] = useState<LiveClassWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      setLoading(false);
      return;
    };

    async function fetchLiveClasses() {
      try {
        const enrollments = await getEnrollmentsByUserId(userInfo.uid);
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        
        if (enrolledCourseIds.length === 0) {
            setLoading(false);
            return;
        }

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
        toast({ title: "Error", description: "Could not fetch your live classes.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    fetchLiveClasses();
  }, [userInfo, toast]);

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

      {liveClasses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveClasses.map((liveClass) => (
                  <Card key={`${liveClass.courseId}-${liveClass.id}`} className="flex flex-col">
                      <CardHeader>
                          <Badge className={`${getPlatformBadgeColor(liveClass.platform)} text-white w-fit`}>
                              {liveClass.platform}
                          </Badge>
                          <CardTitle className="pt-2">{liveClass.topic}</CardTitle>
                          <CardDescription>{liveClass.courseTitle}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/><span>{liveClass.date}</span></div>
                          <div className="flex items-center gap-2"><Clock className="h-4 w-4"/><span>{liveClass.time}</span></div>
                      </CardContent>
                      <CardFooter>
                          <Button asChild className="w-full">
                            <Link href={`/student/my-courses/${liveClass.courseId}/live-classes/${liveClass.id}`}>
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
            <p className="text-muted-foreground">You have no upcoming live classes scheduled.</p>
          </div>
      )}
    </div>
  );
}
