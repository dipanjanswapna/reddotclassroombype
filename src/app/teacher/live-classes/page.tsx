
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getCourses, getInstructorByUid } from '@/lib/firebase/firestore';
import type { Course, LiveClass } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';

type LiveClassWithCourse = LiveClass & {
  courseTitle: string;
  courseId: string;
}

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

export default function TeacherLiveClassesPage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClassWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassData = async () => {
    if (!userInfo) return;
    try {
        const instructor = await getInstructorByUid(userInfo.uid);
        if (!instructor) {
            toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
            if (loading) setLoading(false);
            return;
        }

        const allCourses = await getCourses();
        let manageableCourses: Course[] = [];

        if (instructor.organizationId) {
            manageableCourses = allCourses.filter(course => course.organizationId === instructor.organizationId);
        } else {
            manageableCourses = allCourses.filter(c => c.instructors?.some(i => i.slug === instructor.slug));
        }

        const allClasses = manageableCourses.flatMap(course => 
            (course.liveClasses || []).map(lc => ({...lc, courseTitle: course.title, courseId: course.id!}))
        );
        setLiveClasses(allClasses.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: 'Error', description: 'Could not fetch live class data', variant: 'destructive'});
    } finally {
        if (loading) setLoading(false);
    }
  };


  useEffect(() => {
    if (!userInfo) return;
    fetchClassData();
  }, [userInfo]);

  if(loading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
        </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Live Class Management
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    A central view of all your upcoming live classes.
                </p>
            </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Your Upcoming Classes</CardTitle>
                <CardDescription>
                    To schedule a new class, go to the course builder for the specific course.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {liveClasses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                         {liveClasses.map((liveClass) => (
                            <Card key={liveClass.id} className="flex flex-col">
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
                                        <Link href={`/student/my-courses/${liveClass.courseId}/live-classes/${liveClass.id}`} target="_blank" rel="noopener noreferrer">
                                            <Video className="mr-2" />
                                            Go to Class
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        You have no upcoming live classes.
                    </div>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
