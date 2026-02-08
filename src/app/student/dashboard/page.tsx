'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  BarChart3,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getCoursesByIds, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * @fileOverview Polished Student Dashboard.
 * Synchronized vertical rhythm and premium stats visualization.
 */
export default function DashboardPage() {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrollments: [],
    upcomingDeadlines: [],
    inProgressCourses: [],
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
            });
        }
        
        setStats({
          enrollments,
          upcomingDeadlines,
          inProgressCourses,
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
      <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-background">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
      <div className="space-y-10 md:space-y-14">
          <div className="text-center sm:text-left space-y-2">
              <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                Academic Dashboard
              </h1>
              <p className="text-lg text-muted-foreground font-medium">Welcome back, {userInfo?.name}! Let's continue your growth.</p>
              <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glassmorphism-card border-primary/20 bg-primary/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Active Courses</CardTitle>
                    <BookOpen className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-primary tracking-tighter">{stats.enrollments.length}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Ongoing learning tracks</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-accent/20 bg-accent/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-accent-foreground">Overall Progress</CardTitle>
                     <BarChart3 className="h-5 w-5 text-accent-foreground group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-accent-foreground tracking-tighter">{stats.overallProgress}%</div>
                    <Progress value={stats.overallProgress} className="mt-3 h-1.5 [&>div]:bg-accent" />
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-yellow-500/20 bg-yellow-500/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-yellow-600">Achievements</CardTitle>
                    <Award className="h-5 w-5 text-yellow-600 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-yellow-600 tracking-tighter">{stats.recentAchievements.length}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Milestones earned</p>
                </CardContent>
            </Card>
        </div>
          
          <div className="space-y-6">
            <h2 className="font-headline text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                <div className="h-8 w-1.5 bg-primary rounded-full shadow-sm"></div>
                Continue Learning
            </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {stats.inProgressCourses.length > 0 ? stats.inProgressCourses.map((course: any) => (
                    <Card key={course.id} className="glassmorphism-card flex flex-col border-primary/10 rounded-[2.5rem] shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-500 bg-card">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black uppercase leading-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
                            <p className="text-sm text-muted-foreground font-medium pt-2">Resume where you left off</p>
                        </CardHeader>
                        <CardContent className="flex-grow px-8 pb-8">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground">Course Completion</span>
                                    <span className="text-primary">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-1.5 [&>div]:bg-accent" />
                            </div>
                        </CardContent>
                        <div className="p-8 pt-0 mt-auto">
                          <Button asChild className="w-full font-black uppercase tracking-widest text-xs h-12 rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all bg-primary hover:bg-primary/90 text-white border-none">
                            <Link href={`/student/my-courses/${course.id}`}>Enter Classroom</Link>
                          </Button>
                        </div>
                    </Card>
                )) : (
                    <div className="col-span-full text-center py-20 bg-muted/30 rounded-[3rem] border-2 border-dashed">
                        <p className="text-xl font-bold text-muted-foreground">No active courses yet.</p>
                        <Button asChild variant="link" className="mt-4 font-black uppercase tracking-widest text-xs">
                            <Link href="/courses">Browse Shop &rarr;</Link>
                        </Button>
                    </div>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="rounded-[2.5rem] border-primary/10 shadow-xl overflow-hidden bg-card">
              <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-primary/5 bg-muted/30">
                <CardTitle className="font-black uppercase tracking-tight text-lg">Upcoming Tasks</CardTitle>
                <Button asChild variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest">
                  <Link href="/student/planner">Open Planner</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-primary/5">
                  {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map((deadline: any, index: number) => (
                    <li key={index} className="flex items-start gap-4 p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                        <CalendarCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-base truncate">{deadline.title}</p>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">Due: {new Date(deadline.date as string).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </li>
                  )) : <p className="text-sm text-center text-muted-foreground py-12 font-medium">All caught up! No immediate tasks.</p>}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-primary/10 shadow-xl overflow-hidden bg-card">
              <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-primary/5 bg-muted/30">
                <CardTitle className="font-black uppercase tracking-tight text-lg">Milestones</CardTitle>
                <Button asChild variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest">
                  <Link href="/student/achievements">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-primary/5">
                  {stats.recentAchievements.length > 0 ? stats.recentAchievements.map((ach: any) => (
                    <li key={ach.id} className="flex items-start gap-4 p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 shrink-0">
                        <ach.icon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-base truncate">{ach.title}</p>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-1">{ach.description}</p>
                      </div>
                    </li>
                  )) : <p className="text-sm text-center text-muted-foreground py-12 font-medium">Complete courses to earn achievements!</p>}
                </ul>
              </CardContent>
            </Card>
          </div>
      </div>
  );
}
