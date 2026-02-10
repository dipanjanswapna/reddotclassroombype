'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  BarChart3,
  CalendarCheck,
  Trophy,
  Rocket,
  Flame,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getCoursesByIds, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Course, Assignment } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrollments: [],
    upcomingDeadlines: [],
    inProgressCourses: [],
    completedCoursesCount: 0,
    overallProgress: 0,
    recentAchievements: [],
  } as any);

  useEffect(() => {
    if (!userInfo) return;

    const fetchDashboardData = async () => {
      try {
        const enrollments = await getEnrollmentsByUserId(userInfo.uid);
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        const enrolledCourses = enrolledCourseIds.length > 0 ? await getCoursesByIds(enrolledCourseIds) : [];

        const upcomingDeadlines = (userInfo.studyPlan || [])
            .filter(event => new Date(event.date) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
            
        const completedCoursesCount = enrollments.filter(e => e.status === 'completed').length;

        const inProgressCourses = enrolledCourses
          .filter(c => enrollments.some(e => e.courseId === c.id && e.status === 'in-progress'))
          .slice(0, 2)
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
          
        const achievements = [];
        if (enrollments.length > 0) {
            achievements.push({
                id: 'ach_first_steps',
                title: 'First Steps',
                description: 'Enrolled in your first course!',
                icon: Award,
                color: "text-blue-500"
            });
        }
        const completedCourse = enrolledCourses.find(c => enrollments.some(e => e.courseId === c.id && e.status === 'completed'));
        if (completedCourse) {
            achievements.push({
                id: 'ach_completer',
                title: 'Course Completer',
                description: `Completed ${completedCourse.title}`,
                icon: BookOpen,
                color: "text-green-500"
            });
        }
        let highScoringExam = null;
        for (const course of enrolledCourses) {
            const exam = (course.exams || []).find(e => e.studentId === userInfo.uid && e.status === 'Graded' && e.marksObtained && e.totalMarks > 0 && (e.marksObtained / e.totalMarks) >= 0.9);
            if (exam) {
                highScoringExam = { ...exam, courseTitle: course.title };
                break;
            }
        }
        if (highScoringExam) {
            achievements.push({
                id: 'ach_top_class',
                title: 'Top of the Class',
                description: `Scored high in ${highScoringExam.courseTitle} exam.`,
                icon: Trophy,
                color: "text-yellow-500"
            });
        }

        setStats({
          enrollments,
          upcomingDeadlines,
          inProgressCourses,
          completedCoursesCount,
          overallProgress,
          recentAchievements: achievements.slice(0, 3)
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

  return (
      <div className="space-y-10 md:space-y-14">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-2"
          >
              <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
                স্বাগতম, <span className="text-primary">{userInfo?.name || 'Student'}!</span>
              </h1>
              <p className="text-muted-foreground font-medium text-lg">আপনার শেখার যাত্রা আরও সহজ করতে আমরা প্রস্তুত।</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="rounded-2xl md:rounded-3xl border-none shadow-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white overflow-hidden relative">
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
                <Card className="rounded-2xl md:rounded-3xl border-none shadow-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white overflow-hidden relative">
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
                <Card className="rounded-2xl md:rounded-3xl border-none shadow-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-white overflow-hidden relative">
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
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                <h2 className="font-headline text-2xl font-black uppercase tracking-tight">আপনার শেখা চালিয়ে যান</h2>
                <Button asChild variant="link" className="font-black uppercase text-[10px] tracking-widest text-primary p-0 h-auto">
                    <Link href="/student/my-courses">সকল কোর্স দেখুন</Link>
                </Button>
            </div>
             <div className="grid gap-8 md:grid-cols-2">
                {stats.inProgressCourses.length > 0 ? stats.inProgressCourses.map((course: any) => (
                    <Card key={course.id} className="rounded-2xl md:rounded-3xl border-white/40 bg-[#eef2ed] dark:bg-card/40 shadow-xl overflow-hidden group flex flex-col">
                        <div className="p-6 md:p-8 space-y-6 flex-grow">
                            <div className="space-y-2">
                                <h3 className="font-black text-xl md:text-2xl uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">{course.title}</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">চলমান অধ্যায়: ভৌত বিজ্ঞান প্রথম পত্র</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">কোর্স প্রগ্রেস</span>
                                    <span className="text-xs font-black text-primary">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-2.5 rounded-full bg-white shadow-inner [&>div]:bg-accent" />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 pt-0 mt-auto">
                          <Button asChild size="lg" className="w-full font-black uppercase tracking-widest h-14 rounded-xl shadow-xl shadow-primary/20">
                            <Link href={`/student/my-courses/${course.id}`} className="flex items-center justify-center gap-2">
                                কোর্স চালিয়ে যান
                            </Link>
                          </Button>
                        </div>
                    </Card>
                )) : (
                    <Card className="col-span-2 rounded-3xl border-dashed p-12 text-center bg-muted/20">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground font-bold">You are not enrolled in any courses yet.</p>
                        <Button asChild className="mt-4 rounded-xl font-black uppercase tracking-widest" variant="outline">
                            <Link href="/courses">Browse Courses</Link>
                        </Button>
                    </Card>
                )}
             </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-start">
            <Card className="rounded-3xl border-white/40 shadow-xl bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-primary/5 p-6 border-b border-white/10">
                <CardTitle className="text-lg font-black uppercase tracking-tight">আসন্ন ডেডলাইন</CardTitle>
                <Button asChild variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-primary h-8 px-3 rounded-lg hover:bg-primary/10">
                  <Link href="/student/planner">সব দেখুন</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map((deadline: any, index: number) => (
                    <li key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-white/20 group">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <CalendarCheck className="h-6 w-6" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-black uppercase tracking-tight text-sm truncate">{deadline.title}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Due: {new Date(deadline.date as string).toLocaleDateString()}</p>
                      </div>
                    </li>
                  )) : (
                    <div className="py-8 text-center opacity-40">
                        <CalendarCheck className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No deadlines found</p>
                    </div>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/40 shadow-xl bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-primary/5 p-6 border-b border-white/10">
                <CardTitle className="text-lg font-black uppercase tracking-tight">সাম্প্রতিক অর্জন</CardTitle>
                <Button asChild variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-primary h-8 px-3 rounded-lg hover:bg-primary/10">
                  <Link href="/student/achievements">সব দেখুন</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {stats.recentAchievements.length > 0 ? stats.recentAchievements.map((ach: any) => (
                    <li key={ach.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-white/20 group">
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform", ach.color)}>
                        <ach.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-black uppercase tracking-tight text-sm truncate">{ach.title}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{ach.description}</p>
                      </div>
                    </li>
                  )) : (
                    <div className="py-8 text-center opacity-40">
                        <Trophy className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No achievements yet</p>
                    </div>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
      </div>
  );
}
