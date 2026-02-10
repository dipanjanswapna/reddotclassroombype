'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  CalendarCheck,
  Trophy,
  Rocket,
  Flame,
  Star,
  Bot,
  Voicemail,
  Calculator,
  ChevronRight,
  Sparkles,
  Bell,
  Video,
  Zap,
  Clock,
  ArrowRight,
  Megaphone
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getCoursesByIds, getEnrollmentsByUserId, getNotices } from '@/lib/firebase/firestore';
import type { Course, Notice, LiveClass } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, safeToDate } from '@/lib/utils';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [liveClassNow, setLiveClassNow] = useState<any>(null);
  const [stats, setStats] = useState({
    enrollments: [],
    upcomingDeadlines: [],
    inProgressCourses: [],
    completedCoursesCount: 0,
    overallProgress: 0,
  } as any);

  useEffect(() => {
    if (!userInfo) return;

    const fetchDashboardData = async () => {
      try {
        const [enrollments, fetchedNotices] = await Promise.all([
          getEnrollmentsByUserId(userInfo.uid),
          getNotices({ limit: 3 })
        ]);
        
        setNotices(fetchedNotices);

        const enrolledCourseIds = enrollments.map(e => e.courseId);
        const enrolledCourses = enrolledCourseIds.length > 0 ? await getCoursesByIds(enrolledCourseIds) : [];

        // Check for currently LIVE class
        const now = new Date();
        let foundLive: any = null;
        enrolledCourses.forEach(course => {
            course.liveClasses?.forEach(lc => {
                const start = new Date(`${lc.date}T${lc.time}`);
                const end = addHours(start, 2);
                if (isBefore(start, now) && isAfter(end, now)) {
                    foundLive = { ...lc, courseTitle: course.title, courseId: course.id };
                }
            });
        });
        setLiveClassNow(foundLive);

        const upcomingDeadlines = (userInfo.studyPlan || [])
            .filter(event => new Date(event.date) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
            
        const completedCoursesCount = enrollments.filter(e => e.status === 'completed').length;

        const inProgressCourses = enrolledCourses
          .filter(c => enrollments.some(e => e.courseId === c.id && e.status === 'in-progress'))
          .slice(0, 4)
          .map(course => {
            const enrollment = enrollments.find(e => e.courseId === course.id);
            return {
              ...course,
              progress: enrollment?.progress || 0,
            };
          });
        
        const overallProgress = enrollments.length > 0
          ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
          : 0;
        
        setStats({
          enrollments,
          upcomingDeadlines,
          inProgressCourses,
          completedCoursesCount,
          overallProgress,
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userInfo]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  const aiTools = [
    { title: "AI Tutor", desc: "জিজ্ঞাসা করো তোমার প্রশ্ন", href: "/student/tutor", icon: Bot, color: "bg-pink-100 text-pink-600" },
    { title: "Smart TTS", desc: "নোট অডিওতে শোনো", href: "/student/tts", icon: Voicemail, color: "bg-violet-100 text-violet-600" },
    { title: "Solver", desc: "ম্যাথ সমাধান করো", href: "/student/calculator", icon: Calculator, color: "bg-blue-100 text-blue-600" },
  ];

  return (
      <div className="px-2 md:px-4 space-y-10 md:space-y-14 pb-10">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-l-4 border-primary pl-6"
          >
              <div className="space-y-1">
                  <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
                    স্বাগতম, <span className="text-primary">{userInfo?.name || 'Student'}!</span>
                  </h1>
                  <p className="text-muted-foreground font-medium text-base md:text-lg">পড়াশোনা চালিয়ে যাওয়ার জন্য আপনি প্রস্তুত তো?</p>
              </div>
              <Card className="flex items-center gap-3 px-5 py-2.5 rounded-[20px] bg-amber-50 border-amber-200 shadow-xl border-2">
                <Trophy className="w-6 h-6 text-amber-600 animate-bounce" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">Balance Points</span>
                    <span className="font-black text-xl text-amber-700 leading-none">{userInfo?.referralPoints || 0}</span>
                </div>
              </Card>
          </motion.div>

          {/* Live Alert Banner */}
          <AnimatePresence>
            {liveClassNow && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-[25px] overflow-hidden p-6 bg-red-600 text-white shadow-2xl shadow-red-600/30 group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Video className="w-32 h-32 rotate-12"/></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                <Video className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <Badge className="bg-white text-red-600 font-black text-[9px] uppercase tracking-widest mb-1">LIVE CLASS NOW</Badge>
                                <h2 className="text-xl font-black uppercase tracking-tight leading-tight">{liveClassNow.topic}</h2>
                                <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-tighter">{liveClassNow.courseTitle}</p>
                            </div>
                        </div>
                        <Button asChild size="lg" className="w-full md:w-auto bg-white text-red-600 hover:bg-white/90 font-black uppercase tracking-widest rounded-xl h-12 px-8">
                            <Link href={`/student/my-courses/${liveClassNow.courseId}/live-classes/${liveClassNow.id}`}>Join Now</Link>
                        </Button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="rounded-[25px] border-none shadow-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-20"><BookOpen className="w-20 h-20 rotate-12" /></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-80">এনরোল করা কোর্স</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.enrollments.length}</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-90 flex items-center gap-1.5"><Rocket className="w-3 h-3" /> যাত্রা অব্যাহত রাখুন</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="rounded-[25px] border-none shadow-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-20"><Flame className="w-20 h-20 rotate-12" /></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-80">গড় অগ্রগতি</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.overallProgress}%</div>
                        <div className="mt-4">
                            <Progress value={stats.overallProgress} className="h-2 bg-white/20 [&>div]:bg-white shadow-inner" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="rounded-[25px] border-none shadow-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-20"><Award className="w-20 h-20 rotate-12" /></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-80">অর্জিত সার্টিফিকেট</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.completedCoursesCount}</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-90 flex items-center gap-1.5"><Star className="w-3 h-3 fill-current" /> আপনার সফলতার প্রমাণ</p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>

        {/* AI Toolkit Section */}
        <section className="space-y-6">
            <h2 className="font-headline text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">লার্নিং টুলকিট (AI Powered)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiTools.map((tool, idx) => (
                    <motion.div key={idx} whileHover={{ y: -3 }}>
                        <Link href={tool.href}>
                            <Card className="rounded-[20px] border-primary/10 shadow-lg bg-card group hover:border-primary transition-all p-5 flex items-center gap-4">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", tool.color)}>
                                    <tool.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-black text-sm uppercase tracking-tight">{tool.title}</h3>
                                    <p className="text-[10px] font-medium text-muted-foreground truncate">{tool.desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                <h2 className="font-headline text-2xl font-black uppercase tracking-tight">চালিয়ে যান (Recent Courses)</h2>
                <Button asChild variant="link" className="font-black uppercase text-[10px] tracking-widest text-primary p-0 h-auto">
                    <Link href="/student/my-courses">সকল কোর্স দেখুন</Link>
                </Button>
            </div>
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stats.inProgressCourses.length > 0 ? stats.inProgressCourses.map((course: any) => (
                    <Card key={course.id} className="rounded-[20px] border-primary/20 bg-[#eef2ed] dark:bg-card/40 shadow-xl overflow-hidden group flex flex-col">
                        <div className="p-5 space-y-4 flex-grow">
                            <div className="space-y-1">
                                <h3 className="font-black text-lg uppercase tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-2">{course.title}</h3>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{course.category}</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">কোর্স প্রগ্রেস</span>
                                    <span className="text-[10px] font-black text-primary">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-1.5 rounded-full bg-white shadow-inner [&>div]:bg-accent" />
                            </div>
                        </div>
                        <div className="p-5 pt-0 mt-auto">
                          <Button asChild size="sm" className="w-full font-black uppercase tracking-widest h-10 rounded-xl shadow-xl shadow-primary/20">
                            <Link href={`/student/my-courses/${course.id}`} className="flex items-center justify-center gap-2">
                                চালিয়ে যান <ChevronRight className="w-3 h-3" />
                            </Link>
                          </Button>
                        </div>
                    </Card>
                )) : (
                    <Card className="col-span-full rounded-[25px] border-dashed p-12 text-center bg-muted/20 border-primary/20">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground font-bold">You are not enrolled in any courses yet.</p>
                        <Button asChild className="mt-4 rounded-xl font-black uppercase tracking-widest" variant="outline">
                            <Link href="/courses">Browse Courses</Link>
                        </Button>
                    </Card>
                )}
             </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 items-start">
            {/* Deadlines Section */}
            <Card className="rounded-[25px] border-primary/20 shadow-xl bg-card overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between bg-primary/5 p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base font-black uppercase tracking-tight">আসন্ন ডেডলাইন</CardTitle>
                </div>
                <Button asChild variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-primary h-8 px-3 rounded-lg hover:bg-primary/10">
                  <Link href="/student/planner">সব দেখুন</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                <ul className="space-y-3">
                  {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map((deadline: any, index: number) => (
                    <li key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-white/20 group">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-black uppercase tracking-tight text-xs truncate">{deadline.title}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Due: {format(new Date(deadline.date as string), 'dd MMM yyyy')}</p>
                      </div>
                    </li>
                  )) : (
                    <div className="py-10 text-center opacity-40">
                        <CalendarCheck className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest">No deadlines found</p>
                    </div>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Notice Board Section */}
            <Card className="rounded-[25px] border-primary/20 shadow-xl bg-card overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between bg-accent/5 p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-accent" />
                    <CardTitle className="text-base font-black uppercase tracking-tight">নোটিশ বোর্ড</CardTitle>
                </div>
                <Button asChild variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-accent h-8 px-3 rounded-lg hover:bg-accent/10">
                  <Link href="/">হোমে দেখুন</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                <ul className="space-y-3">
                  {notices.length > 0 ? notices.map((notice) => (
                    <li key={notice.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-white/20 group cursor-pointer">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform mt-0.5">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-black uppercase tracking-tight text-xs line-clamp-1">{notice.title}</p>
                        <p className="text-[10px] font-medium text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{notice.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10 text-accent">{format(safeToDate(notice.publishedAt), 'dd MMM')}</span>
                        </div>
                      </div>
                    </li>
                  )) : (
                    <div className="py-10 text-center opacity-40">
                        <Bell className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest">No recent notices</p>
                    </div>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
      </div>
  );
}
