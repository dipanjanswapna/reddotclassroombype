
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Clock, MonitorPlay, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import type { Course } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

function getPlatformBadgeColor(platform: string) {
    switch (platform.toLowerCase()) {
        case 'youtube live':
            return 'bg-red-600';
        case 'facebook live':
            return 'bg-blue-600';
        case 'zoom':
            return 'bg-sky-500';
        case 'google meet':
            return 'bg-green-600';
        default:
            return 'bg-gray-500';
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
      <div className="flex items-center justify-center h-full min-h-[400px]">
          <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }
  
  if (!course) {
    notFound();
  }

  const liveClasses = course.liveClasses?.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2 border-l-4 border-primary pl-4"
      >
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Live <span className="text-primary">Sessions</span></h1>
        <p className="mt-1 text-muted-foreground font-medium">Join upcoming live interactive classes for {course.title}.</p>
      </motion.div>

      {liveClasses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {liveClasses.map((liveClass, idx) => (
                  <motion.div
                    key={liveClass.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="flex flex-col h-full rounded-[20px] border-primary/20 shadow-xl overflow-hidden hover:border-primary transition-all duration-300 group bg-card">
                        <div className="h-2 bg-primary/10 w-full group-hover:bg-primary transition-colors" />
                        <CardHeader className="p-6">
                            <Badge className={`${getPlatformBadgeColor(liveClass.platform)} text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 mb-3 shadow-sm border-none`}>
                                {liveClass.platform}
                            </Badge>
                            <CardTitle className="text-xl font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{liveClass.topic}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 flex-grow space-y-3">
                            <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="bg-primary/5 p-2 rounded-lg"><Calendar className="h-4 w-4 text-primary"/></div>
                                <span>{format(safeToDate(liveClass.date), 'dd MMM yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="bg-primary/5 p-2 rounded-lg"><Clock className="h-4 w-4 text-primary"/></div>
                                <span>{liveClass.time}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 border-t border-primary/5 bg-primary/[0.02]">
                            <Button asChild className="w-full h-11 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform">
                                <Link href={`/student/my-courses/${course.id}/live-classes/${liveClass.id}`}>
                                    <MonitorPlay className="mr-2 h-4 w-4" />
                                    Join Interactive Session
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                  </motion.div>
              ))}
          </div>
      ) : (
         <div className="text-center py-24 bg-muted/5 border-2 border-dashed border-primary/10 rounded-[20px] flex flex-col items-center">
            <Video className="w-12 h-12 text-primary/20 mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-40">No live sessions scheduled</p>
        </div>
      )}
    </div>
  );
}
