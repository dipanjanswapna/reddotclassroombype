
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCourse, markAllAnnouncementsAsRead } from '@/lib/firebase/firestore';
import type { Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, CheckCheck, Pin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';

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
    } catch(e) {
        toast({ title: 'Error', description: 'Could not mark announcements as read.', variant: 'destructive'});
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full min-h-[400px]"><LoadingSpinner className="w-10 h-10" /></div>;
  }
  
  if (!course) {
    notFound();
  }

  const announcements = course.announcements || [];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-l-4 border-primary pl-3"
      >
        <div>
            <h1 className="font-headline text-2xl font-black tracking-tight uppercase text-foreground">Important <span className="text-primary">Notices</span></h1>
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium">Critical updates for {course.title}.</p>
        </div>
        <Button onClick={handleMarkAsRead} variant="outline" size="sm" className="rounded-xl font-black text-[8px] uppercase tracking-widest h-9 px-4 border-primary/20">
            <CheckCheck className="mr-1.5 h-3.5 w-3.5"/>
            Mark All
        </Button>
      </motion.div>

      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((ann, idx) => (
            <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
            >
                <Card className="rounded-[20px] border-primary/20 shadow-xl bg-card overflow-hidden group">
                    <CardHeader className="bg-primary/5 p-4 border-b border-primary/10">
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary p-2 rounded-xl shadow-md text-white group-hover:scale-110 transition-transform">
                                    <Pin className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-base font-black uppercase tracking-tight leading-tight">{ann.title}</CardTitle>
                                    <CardDescription className="font-bold text-[8px] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                        <Calendar className="w-2.5 h-2.5 text-primary" />
                                        Posted: {format(safeToDate(ann.date), 'dd MMM yyyy')}
                                    </CardDescription>
                                </div>
                            </div>
                            <Megaphone className="w-5 h-5 text-primary/20 shrink-0 hidden xs:block"/>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5">
                        <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                    </CardContent>
                </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/5 border-2 border-dashed border-primary/10 rounded-[20px] flex flex-col items-center">
            <Megaphone className="w-10 h-10 text-primary/20 mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] opacity-40">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
