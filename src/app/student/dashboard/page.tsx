
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
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
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
  } as any);

  useEffect(() => {
    if (!userInfo) return;

    const fetchDashboardData = async () => {
      try {
        const [allCourses, enrollments] = await Promise.all([
          getCourses(),
          getEnrollmentsByUserId(userInfo.uid)
        ]);

        const enrolledCourseIds = enrollments.map(e => e.courseId);
        const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id!));

        const upcomingDeadlines = enrolledCourses
          .flatMap(c => c.assignments || [])
          .filter(a => a.studentId === userInfo.uid && (a.status === 'Pending' || a.status === 'Late'))
          .sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime())
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

        setStats({
          enrollments,
          upcomingDeadlines,
          inProgressCourses,
          completedCoursesCount,
          overallProgress
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
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="mb-6">
              <h1 className="font-headline text-3xl font-bold tracking-tight">স্বাগতম, {userInfo?.name || 'Student'}!</h1>
              <p className="text-muted-foreground">আপনার পরবর্তী ক্লাস আজ সন্ধ্যা ৭টায়। শুরু করার জন্য প্রস্তুত হন!</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">চলমান কোর্স</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{stats.enrollments.length}</div>
                      <p className="text-xs text-muted-foreground">আপনার শেখা চালিয়ে যান!</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">সামগ্রিক অগ্রগতি</CardTitle>
                       <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{stats.overallProgress}%</div>
                      <Progress value={stats.overallProgress} className="mt-2 h-2 [&>div]:bg-accent" />
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">অর্জিত সার্টিফিকেট</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{stats.completedCoursesCount}</div>
                      <p className="text-xs text-muted-foreground">আপনি সম্প্রতি একটি কোর্স সম্পন্ন করেছেন।</p>
                  </CardContent>
              </Card>
          </div>
          
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">আপনার শেখা চালিয়ে যান</h2>
             <div className="grid gap-6 md:grid-cols-2">
                {stats.inProgressCourses.length > 0 ? stats.inProgressCourses.map((course: any) => (
                    <Card key={course.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{course.title}</CardTitle>
                            <p className="text-sm text-muted-foreground pt-1">পরবর্তী লেসন: ভৌত বিজ্ঞান প্রথম পত্র</p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <Progress value={course.progress} className="mb-2 h-2 [&>div]:bg-accent" />
                            <p className="text-sm font-medium">{course.progress}% সম্পন্ন</p>
                        </CardContent>
                        <div className="p-6 pt-0">
                          <Button asChild className="w-full">
                            <Link href={`/student/my-courses/${course.id}`}>কোর্স চালিয়ে যান</Link>
                          </Button>
                        </div>
                    </Card>
                )) : (
                    <p className="text-muted-foreground col-span-2 text-center py-8">You are not enrolled in any courses yet.</p>
                )}
             </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>আসন্ন ডেডলাইন</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/student/deadlines">
                    সব দেখুন
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map((deadline: Assignment, index: number) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{deadline.title}</p>
                        <p className="text-sm text-muted-foreground">Due: {new Date(deadline.deadline as string).toLocaleDateString()}</p>
                      </div>
                    </li>
                  )) : <p className="text-sm text-muted-foreground">No upcoming deadlines. You're all caught up!</p>}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>সাম্প্রতিক অর্জন</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/student/achievements">
                    সব দেখুন
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No recent achievements yet.</p>
              </CardContent>
            </Card>
          </div>
      </div>
  );
}
