
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MessageSquare, MonitorPlay } from 'lucide-react';
import FacebookComments from '@/components/facebook-comments';
import { LiveVideoPlayer } from '@/components/live-video-player';

const getLiveClassData = (courseId: string, liveClassId: string) => {
  const course = courses.find((c) => c.id === courseId);
  if (!course || !course.liveClasses) return null;

  const liveClass = course.liveClasses.find((lc) => lc.id === liveClassId);
  if (!liveClass) return null;
  
  return { course, liveClass };
};

export default function LiveClassViewerPage({
  params,
}: {
  params: { courseId: string; liveClassId: string };
}) {
  const data = getLiveClassData(params.courseId, params.liveClassId);
  
  if (!data) {
    notFound();
  }

  const { course, liveClass } = data;

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

    
