
'use client';

import { useState, useEffect } from 'react';
import {
  BookCopy,
  Users,
  MessageSquare,
  BarChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourses, getInstructorByUid, getEnrollments } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

export default function TeacherDashboardPage() {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    courseCount: 0,
    studentCount: 0,
    pendingGradingCount: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) return;

    const fetchDashboardData = async () => {
      try {
        const instructor = await getInstructorByUid(userInfo.uid);
        if (!instructor?.id) {
          toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        
        const [allCourses, allEnrollments] = await Promise.all([
          getCourses(),
          getEnrollments()
        ]);
        
        const teacherCourses = allCourses.filter(course => 
          course.instructors?.some(i => i.slug === instructor.slug)
        );

        const teacherCourseIds = teacherCourses.map(c => c.id);

        const studentIds = new Set<string>();
        allEnrollments.forEach(enrollment => {
          if (teacherCourseIds.includes(enrollment.courseId)) {
            studentIds.add(enrollment.userId);
          }
        });


        let pendingGradingCount = 0;
        let totalRating = 0;
        let ratedCourses = 0;

        teacherCourses.forEach(course => {
          (course.assignments || []).forEach(assignment => {
            if (assignment.status === 'Submitted' || assignment.status === 'Late') {
              pendingGradingCount++;
            }
          });
          if (course.rating) {
            totalRating += course.rating;
            ratedCourses++;
          }
        });

        const averageRating = ratedCourses > 0 ? (totalRating / ratedCourses) : 0;

        setStats({
          courseCount: teacherCourses.length,
          studentCount: studentIds.size,
          pendingGradingCount,
          averageRating: parseFloat(averageRating.toFixed(1)),
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userInfo, toast]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight">
            Teacher Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Manage your courses, students, and content.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                My Courses
                </CardTitle>
                <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.courseCount}</div>
                <p className="text-xs text-muted-foreground">
                Active courses
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.studentCount}</div>
                <p className="text-xs text-muted-foreground">
                Across all courses
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Pending Grading
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.pendingGradingCount}</div>
                <p className="text-xs text-muted-foreground">
                Assignments to review
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Average Rating
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}</div>
                <p className="text-xs text-muted-foreground">
                From student reviews
                </p>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
