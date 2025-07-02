
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MessageSquare, MonitorPlay } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import type { Course, LiveClass } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Live Class',
    description: 'Join your live class session.',
};

const FacebookComments = dynamic(() => import('@/components/facebook-comments'), {
    ssr: false,
    loading: () => <Skeleton className="h-24 w-full" />,
});

const LiveVideoPlayer = dynamic(() => import('@/components/live-video-player').then(mod => mod.LiveVideoPlayer), {
    ssr: false,
    loading: () => <Skeleton className="w-full aspect-video" />,
});


export default function LiveClassViewerPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const liveClassId = params.liveClassId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchLiveClassData = async () => {
          if (!courseId) return;
          try {
              const courseData = await getCourse(courseId);
              if (courseData) {
                  setCourse(courseData);
                  const classData = courseData.liveClasses?.find((lc) => lc.id === liveClassId);
                  if (classData) {
                      setLiveClass(classData);
                  }
              }
          } catch(e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      fetchLiveClassData();
  }, [courseId, liveClassId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
          <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (!course || !liveClass) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold">{course.title}</p>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {liveClass.topic}
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground mt-2 text-sm">
            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/><span>{liveClass.date}</span></div>
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4"/><span>{liveClass.time}</span></div>
            <div className="flex items-center gap-1.5"><MonitorPlay className="w-4 h-4"/><span>{liveClass.platform}</span></div>
        </div>
      </div>

      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <LiveVideoPlayer platform={liveClass.platform} url={liveClass.joinUrl} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare />
            Live Chat & Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FacebookComments href={liveClass.joinUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
