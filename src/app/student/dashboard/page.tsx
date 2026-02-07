'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  BarChart3,
  CalendarCheck,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getCoursesByIds, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Course, Assignment } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

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
          
        // --- Achievements Calculation ---
        const achievements = [];
        // 1. First Enrollment
        if (enrollments.length > 0) {
            achievements.push({
                id: 'ach_first_steps',
                title: 'First Steps',
                description: 'Enrolled in your first course!',
                icon: Award,
            });
        }
        // 2. Course Completion
        const completedCourse = enrolledCourses.find(c => enrollments.some(e => e.courseId === c.id && e.status === 'completed'));
        if (completedCourse) {
            achievements.push({
                id: 'ach_completer',
                title: 'Course Completer',
                description: `Completed ${completedCourse.title}`,
                icon: BookOpen,
            });
        }
        // 3. High Score
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
      <div className="p-4 sm:p-6 lg:p-8 space-y-12">
          <div className="mb-6">
              <h1 className="font-headline text-3xl font-bold tracking-tight">Welcome back, {userInfo?.name || 'Student'}!</h1>
              <p className="text-muted-foreground">You have 1 class scheduled for this evening. Ready to dive back in?</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Card className="glassmorphism-card bg-primary/10 border-primary/20 flex-1 min-w-[280px] max-w-[400px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Active Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">{stats.enrollments.length}</div>
                    <p className="text-xs text-muted-foreground">Courses you are currently learning</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card bg-accent/10 border-accent/20 flex-1 min-w-[280px] max-w-[400px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-accent-foreground">Overall Progress</CardTitle>
                     <BarChart3 className="h-4 w-4 text-accent-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-accent-foreground">{stats.overallProgress}%</div>
                    <Progress value={stats.overallProgress} className="mt-2 h-2 [&>div]:bg-accent" />
                </CardContent>
            </Card>
            <Card className="glassmorphism-card bg-yellow-500/10 border-yellow-500/20 flex-1 min-w-[280px] max-w-[400px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-600">Certificates Earned</CardTitle>
                    <Award className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.completedCoursesCount}</div>
                    <p className="text-xs text-muted-foreground">Milestones achieved on your journey</p>
                </CardContent>
            </Card>
        </div>
          
          <div>
            <h2 className="font-headline text-2xl font-bold mb-6 text-center sm:text-left">Pick Up Where You Left Off</h2>
             <div className="flex flex-wrap justify-center sm:justify-start gap-8">
                {stats.inProgressCourses.length > 0 ? stats.inProgressCourses.map((course: any) => (
                    <Card key={course.id} className="glassmorphism-card flex flex-col flex-1 min-w-[280px] max-w-[450px]">
                        <CardHeader>
                            <CardTitle>{course.title}</CardTitle>
                            <p className="text-sm text-muted-foreground pt-1">Continue your next lesson to stay on track</p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <Progress value={course.progress} className="mb-2 h-2 [&>div]:bg-accent" />
                            <p className="text-sm font-medium">{course.progress}% Completed</p>
                        </CardContent>
                        <div className="p-6 pt-0">
                          <Button asChild className="w-full font-bold">
                            <Link href={`/student/my-courses/${course.id}`}>Resume Course</Link>
                          </Button>
                        </div>
                    </Card>
                )) : (
                    <div className="w-full text-center py-12 bg-muted/50 rounded-xl border-2 border-dashed">
                        <p className="text-muted-foreground">You haven't started any courses yet. Explore our shop to find something interesting!</p>
                        <Button asChild variant="link" className="mt-4">
                            <Link href="/courses">Browse Courses &rarr;</Link>
                        </Button>
                    </div>
                )}
             </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <Card className="glassmorphism-card flex-1 min-w-[280px] max-w-[600px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Deadlines</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/student/planner">
                    View Planner
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map((deadline: any, index: number) => (
                    <li key={index} className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{deadline.title}</p>
                        <p className="text-sm text-muted-foreground">Due Date: {new Date(deadline.date as string).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </li>
                  )) : <p className="text-sm text-center text-muted-foreground py-8">All caught up! No immediate deadlines.</p>}
                </ul>
              </CardContent>
            </Card>

            <Card className="glassmorphism-card flex-1 min-w-[280px] max-w-[600px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Achievements</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/student/achievements">
                    Full Profile
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {stats.recentAchievements.length > 0 ? stats.recentAchievements.map((ach: any) => (
                    <li key={ach.id} className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                        <ach.icon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{ach.title}</p>
                        <p className="text-sm text-muted-foreground">{ach.description}</p>
                      </div>
                    </li>
                  )) : <p className="text-sm text-center text-muted-foreground py-8">Keep learning to unlock your first achievement!</p>}
                </ul>
              </CardContent>
            </Card>
          </div>
      </div>
  );
}
