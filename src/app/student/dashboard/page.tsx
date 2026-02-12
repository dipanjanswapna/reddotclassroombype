
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
  Megaphone,
  TrendingUp,
  User,
  Crown,
  History
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getCoursesByIds, getEnrollmentsByUserId, getNotices, getTasksForUser } from '@/lib/firebase/firestore';
import type { Course, Notice, LiveClass, PlannerTask } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, safeToDate } from '@/lib/utils';
import { format, isAfter, isBefore, addHours, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [liveClassNow, setLiveClassNow] = useState<any>(null);
  const [studyTimeToday, setStudyTimeToday] = useState(0);
  const [stats, setStats] = useState({
    enrollments: [],
    upcomingDeadlines: [],
    inProgressCourses: [],
    completedCoursesCount: 0,
    overallProgress: 0,
    streak: 12, 
    rank: 42,   
  } as any);

  useEffect(() => {
    if (!userInfo) return;

    const fetchDashboardData = async () => {
      try {
        const [enrollments, fetchedNotices, plannerTasks] = await Promise.all([
          getEnrollmentsByUserId(userInfo.uid),
          getNotices({ limit: 3 }),
          getTasksForUser(userInfo.uid)
        ]);
        
        setNotices(fetchedNotices);

        const todaySeconds = plannerTasks
            .filter(task => task.completedAt && isToday(safeToDate(task.completedAt)))
            .reduce((sum, task) => sum + (task.timeSpentSeconds || 0), 0);
        setStudyTimeToday(Math.floor(todaySeconds / 60));

        const enrolledCourseIds = enrollments.map(e => e.courseId);
        const enrolledCourses = enrolledCourseIds.length > 0 ? await getCoursesByIds(enrolledCourseIds) : [];

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
          streak: 12,
          rank: 42
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
      <div className="px-1 space-y-8 md:space-y-12 pb-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between border-l-4 border-primary pl-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-1"
              >
                  <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
                    স্বাগতম, <span className="text-primary">{userInfo?.name?.split(' ')[0] || 'Student'}!</span>
                  </h1>
                  <p className="text-muted-foreground font-medium text-base md:text-lg">পড়াশোনার আজকের লক্ষ্যগুলো পূরণ করতে প্রস্তুত তো?</p>
              </motion.div>
              
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <Card className="flex items-center gap-3 px-4 py-2 rounded-[20px] bg-orange-50 border-orange-200 shadow-sm border-2">
                    <Flame className="w-5 h-5 text-orange-600 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-700/60">Study Streak</span>
                        <span className="font-black text-lg text-orange-700 leading-none">{stats.streak} Days</span>
                    </div>
                </Card>
                <Card className="flex items-center gap-3 px-4 py-2 rounded-[20px] bg-blue-50 border-blue-200 shadow-sm border-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-700/60">Study Today</span>
                        <span className="font-black text-lg text-blue-700 leading-none">{studyTimeToday} Min</span>
                    </div>
                </Card>
                <Card className="flex items-center gap-3 px-4 py-2 rounded-[20px] bg-amber-50 border-amber-200 shadow-sm border-2">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">Points</span>
                        <span className="font-black text-lg text-amber-700 leading-none">{userInfo?.referralPoints || 0}</span>
                    </div>
                </Card>
              </div>
          </div>

          <AnimatePresence>
            {liveClassNow && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-[20px] overflow-hidden p-6 bg-red-600 text-white shadow-2xl shadow-red-600/30 group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Video className="w-32 h-32 rotate-12"/></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="h-12 w-12 rounded-[16px] bg-white/20 flex items-center justify-center shrink-0">
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-[20px] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><BookOpen className="w-16 h-16 rotate-12" /></div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">আমার কোর্সসমূহ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.enrollments.length}</div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-2 opacity-90 flex items-center gap-1.5"><Rocket className="w-3 h-3" /> যাত্রা অব্যাহত রাখুন</p>
                </CardContent>
            </Card>

            <Card className="rounded-[20px] border-none shadow-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><TrendingUp className="w-16 h-16 rotate-12" /></div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">গড় অগ্রগতি</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.overallProgress}%</div>
                    <div className="mt-4">
                        <Progress value={stats.overallProgress} className="h-1.5 bg-white/20 [&>div]:bg-white" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[20px] border-none shadow-xl bg-gradient-to-br from-amber-500 to-orange-400 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><Award className="w-16 h-16 rotate-12" /></div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">অর্জিত সার্টিফিকেট</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.completedCoursesCount}</div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-2 opacity-90 flex items-center gap-1.5"><Star className="w-3 h-3 fill-current" /> আপনার সফলতার প্রমাণ</p>
                </CardContent>
            </Card>

            <Card className="rounded-[20px] border-none shadow-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><Crown className="w-16 h-16 rotate-12" /></div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">লিডারবোর্ড র‍্যাঙ্ক</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">#{stats.rank}</div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-2 opacity-90 flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> শীর্ষে পৌঁছাতে লড়াই করো</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
                <section className="space-y-6">
                    <h2 className="font-headline text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">লার্নিং টুলকিট (AI Powered)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiTools.map((tool, idx) => (
                            <motion.div key={idx} whileHover={{ y: -3 }}>
                                <Link href={tool.href}>
                                    <Card className="rounded-[20px] border-primary/10 shadow-lg bg-card group hover:border-primary transition-all p-5 flex items-center gap-4">
                                        <div className={cn("h-12 w-12 rounded-[16px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", tool.color)}>
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

                <section className="space-y-6">
                    <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                        <h2 className="font-headline text-2xl font-black uppercase tracking-tight">চালিয়ে যান (Recent Courses)</h2>
                        <Button asChild variant="link" className="font-black uppercase text-[10px] tracking-widest text-primary p-0 h-auto">
                            <Link href="/student/my-courses">সকল কোর্স দেখুন</Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
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
                            <Card className="col-span-full rounded-[20px] border-dashed p-12 text-center bg-muted/20 border-primary/20">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-muted-foreground font-bold">You are not enrolled in any courses yet.</p>
                                <Button asChild className="mt-4 rounded-xl font-black uppercase tracking-widest" variant="outline">
                                    <Link href="/courses">Browse Courses</Link>
                                </Button>
                            </Card>
                        )}
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                <Card className="rounded-[20px] border-primary/20 shadow-xl bg-card overflow-hidden">
                    <CardHeader className="bg-primary/5 p-5 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-primary" />
                                <CardTitle className="text-sm font-black uppercase tracking-tight">আসন্ন ডেডলাইন</CardTitle>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0">
                                <Link href="/student/planner"><ChevronRight className="w-4 h-4" /></Link>
                            </Button>
                        </div>
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
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Due: {format(new Date(deadline.date as string), 'dd MMM')}</p>
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

                <Card className="rounded-[20px] border-primary/20 shadow-xl bg-card overflow-hidden">
                    <CardHeader className="bg-accent/5 p-5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-accent" />
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Leaderboard</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        {[
                            { name: 'Rafid Ahmed', points: 12450, rank: 1, avatar: 'RA' },
                            { name: 'Samiul Hasan', points: 11200, rank: 2, avatar: 'SH' },
                            { name: 'Anika Tabassum', points: 10800, rank: 3, avatar: 'AT' },
                        ].map((user, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-muted/20">
                                <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs",
                                    i === 0 ? "bg-yellow-400 text-yellow-900" : "bg-white border text-foreground"
                                )}>{user.avatar}</div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-xs truncate">{user.name}</p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase">{user.points} XP</p>
                                </div>
                                <Badge className="bg-transparent text-foreground border-none font-black text-xs">#{user.rank}</Badge>
                            </div>
                        ))}
                        <Button asChild variant="outline" className="w-full h-10 rounded-xl font-black uppercase text-[9px] tracking-widest border-primary/10">
                            <Link href="/student/leaderboard">View Full Board</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="rounded-[20px] border-primary/20 shadow-xl bg-accent/5 p-5 border-b border-white/10">
                    <CardHeader className="bg-accent/5 p-5 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-accent" />
                                <CardTitle className="text-sm font-black uppercase tracking-tight">নোটিশ বোর্ড</CardTitle>
                            </div>
                        </div>
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
      </div>
  );
}
