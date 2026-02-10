
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getCoursesByIds, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { Course, LiveClass } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, MonitorPlay, Sparkles, ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, safeToDate } from '@/lib/utils';
import { format, isAfter, isBefore, addHours } from 'date-fns';

type LiveClassWithMetadata = LiveClass & {
    courseTitle: string;
    courseId: string;
    status: 'live' | 'upcoming' | 'past';
};

export default function StudentLiveClassesPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [liveClasses, setLiveClasses] = useState<LiveClassWithMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchLiveClasses = async () => {
            try {
                const enrollments = await getEnrollmentsByUserId(userInfo.uid);
                const courseIds = enrollments.map(e => e.courseId);
                
                if (courseIds.length === 0) {
                    setLoading(false);
                    return;
                }

                const courses = await getCoursesByIds(courseIds);
                const allLiveClasses: LiveClassWithMetadata[] = [];
                const now = new Date();

                courses.forEach(course => {
                    if (course.liveClasses) {
                        course.liveClasses.forEach(lc => {
                            const classDateTime = new Date(`${lc.date}T${lc.time}`);
                            const classEndDateTime = addHours(classDateTime, 2); // Assume 2 hour duration

                            let status: 'live' | 'upcoming' | 'past' = 'upcoming';
                            if (isBefore(classDateTime, now) && isAfter(classEndDateTime, now)) {
                                status = 'live';
                            } else if (isBefore(classEndDateTime, now)) {
                                status = 'past';
                            }

                            allLiveClasses.push({
                                ...lc,
                                courseTitle: course.title,
                                courseId: course.id!,
                                status
                            });
                        });
                    }
                });

                // Sort: Live first, then upcoming by date, then past by date descending
                allLiveClasses.sort((a, b) => {
                    if (a.status === 'live' && b.status !== 'live') return -1;
                    if (b.status === 'live' && a.status !== 'live') return 1;
                    
                    const dateA = new Date(`${a.date}T${a.time}`).getTime();
                    const dateB = new Date(`${b.date}T${b.time}`).getTime();
                    
                    if (a.status === 'past') return dateB - dateA;
                    return dateA - dateB;
                });

                setLiveClasses(allLiveClasses);
            } catch (error) {
                console.error("Failed to fetch live classes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveClasses();
    }, [userInfo, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    const liveNow = liveClasses.filter(c => c.status === 'live');
    const upcoming = liveClasses.filter(c => c.status === 'upcoming');
    const past = liveClasses.filter(c => c.status === 'past');

    return (
        <div className="px-2 md:px-4 py-4 md:py-8 space-y-10 md:space-y-14">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1 border-l-4 border-primary pl-4"
            >
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-primary/20">
                    <Video className="w-3 h-3" />
                    Live Learning
                </div>
                <h1 className="font-headline text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
                    Interactive <span className="text-primary">Sessions</span>
                </h1>
                <p className="text-muted-foreground font-medium text-xs md:text-sm">
                    আপনার এনরোল করা কোর্সের সকল লাইভ ক্লাস এবং রেকর্ডিং এখানে পাবেন।
                </p>
            </motion.div>

            <div className="space-y-12">
                {/* LIVE NOW SECTION */}
                {liveNow.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                            <h2 className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-red-600">Live Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {liveNow.map(lc => (
                                <LiveClassCard key={lc.id} lc={lc} />
                            ))}
                        </div>
                    </section>
                )}

                {/* UPCOMING SECTION */}
                <section className="space-y-6">
                    <h2 className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-muted-foreground border-l-2 border-primary/20 pl-3">Upcoming Classes</h2>
                    {upcoming.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {upcoming.map(lc => (
                                <LiveClassCard key={lc.id} lc={lc} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-muted/20 border-2 border-dashed border-primary/10 rounded-[20px] flex flex-col items-center">
                            <Calendar className="w-10 h-10 text-primary/20 mx-auto mb-3 opacity-40" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] opacity-40">No classes scheduled soon</p>
                        </div>
                    )}
                </section>

                {/* PAST / RECORDED SECTION */}
                {past.length > 0 && (
                    <section className="space-y-6 opacity-80">
                        <h2 className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-muted-foreground border-l-2 border-primary/20 pl-3">Past Recordings</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {past.map(lc => (
                                <LiveClassCard key={lc.id} lc={lc} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function LiveClassCard({ lc }: { lc: LiveClassWithMetadata }) {
    const isLive = lc.status === 'live';
    const isPast = lc.status === 'past';

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className={cn(
                "h-full flex flex-col rounded-[20px] border-primary/20 shadow-xl overflow-hidden group transition-all duration-300",
                isLive ? "ring-2 ring-red-600 ring-offset-2 ring-offset-background bg-red-50/30 dark:bg-red-950/10" : "bg-card"
            )}>
                <div className={cn(
                    "h-1.5 w-full transition-colors",
                    isLive ? "bg-red-600" : "bg-primary/10 group-hover:bg-primary"
                )} />
                <CardHeader className="p-5">
                    <div className="flex justify-between items-start gap-2 mb-3">
                        <Badge className={cn(
                            "font-black text-[8px] uppercase tracking-widest px-2.5 h-5 shadow-sm border-none",
                            isLive ? "bg-red-600 text-white animate-pulse" : "bg-primary/10 text-primary"
                        )}>
                            {isLive ? 'Live Now' : lc.platform}
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground/40 font-mono">#{lc.id.slice(-4)}</span>
                    </div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                        {lc.topic}
                    </CardTitle>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">
                        {lc.courseTitle}
                    </p>
                </CardHeader>
                <CardContent className="px-5 flex-grow space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <div className="bg-primary/5 p-2 rounded-xl border border-primary/10">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span>{format(safeToDate(lc.date), 'dd MMMM, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <div className="bg-primary/5 p-2 rounded-xl border border-primary/10">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span>{lc.time} (BD Time)</span>
                    </div>
                </CardContent>
                <CardFooter className="p-5 border-t border-primary/5 bg-primary/[0.02]">
                    <Button 
                        asChild 
                        className={cn(
                            "w-full h-11 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition-transform active:scale-95",
                            isLive ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20" : "shadow-primary/20"
                        )}
                    >
                        <Link href={`/student/my-courses/${lc.courseId}/live-classes/${lc.id}`}>
                            {isPast ? (
                                <><PlayCircle className="mr-2 h-4 w-4" /> Watch Recording</>
                            ) : (
                                <><MonitorPlay className="mr-2 h-4 w-4" /> {isLive ? 'Join Session Now' : 'Join Interactive Session'}</>
                            )}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
