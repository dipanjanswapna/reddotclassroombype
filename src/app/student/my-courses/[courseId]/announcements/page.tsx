
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
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-l-4 border-primary pl-4"
      >
        <div>
            <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Important <span className="text-primary">Notices</span></h1>
            <p className="mt-1 text-muted-foreground font-medium">Critical updates and news for {course.title}.</p>
        </div>
        <Button onClick={handleMarkAsRead} variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 border-primary/20">
            <CheckCheck className="mr-2 h-4 w-4"/>
            Mark All as Read
        </Button>
      </motion.div>

      <div className="space-y-6">
        {announcements.length > 0 ? (
          announcements.map((ann, idx) => (
            <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
            >
                <Card className="rounded-[20px] border-primary/20 shadow-xl bg-card overflow-hidden group">
                    <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20 text-white group-hover:scale-110 transition-transform">
                                    <Pin className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight leading-tight">{ann.title}</CardTitle>
                                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                        <Calendar className="w-3 h-3 text-primary" />
                                        Posted: {format(safeToDate(ann.date), 'PPP')}
                                    </CardDescription>
                                </div>
                            </div>
                            <Megaphone className="w-6 h-6 text-primary/20 shrink-0 hidden sm:block"/>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                    </CardContent>
                </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-24 bg-muted/5 border-2 border-dashed border-primary/10 rounded-[20px] flex flex-col items-center">
            <Megaphone className="w-12 h-12 text-primary/20 mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-40">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
