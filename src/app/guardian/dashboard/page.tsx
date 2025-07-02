
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  BarChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getUser, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Guardian Dashboard',
    description: 'Monitor your child\'s academic progress.',
};

export default function GuardianDashboardPage() {
    const { userInfo: guardian, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [student, setStudent] = useState<UserType | null>(null);
    const [stats, setStats] = useState({
      enrolledCoursesCount: 0,
      overallProgress: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        const fetchDashboardData = async () => {
             if (!guardian || !guardian.linkedStudentId) {
                setLoading(false);
                return;
            }

            try {
                const studentData = await getUser(guardian.linkedStudentId);
                setStudent(studentData);

                if(studentData) {
                    const enrollments = await getEnrollmentsByUserId(studentData.id!);
                    const enrolledCoursesCount = enrollments.length;
                    const overallProgress = enrollments.length > 0 
                        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length) 
                        : 0;
                    setStats({ enrolledCoursesCount, overallProgress });
                }
            } catch (error) {
                 console.error("Failed to fetch guardian dashboard data:", error);
                 toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [authLoading, guardian, toast]);
  
    if(loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    if (!student) {
      return (
          <div className="p-4 sm:p-6 lg:p-8">
             <h1 className="font-headline text-4xl font-bold tracking-tight">Guardian Dashboard</h1>
             <p className="mt-4 text-muted-foreground">No student is currently linked to your account. Please ask your child to send an invitation from their portal's Guardian page.</p>
          </div>
      );
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          Guardian Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Monitor your child's academic progress.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Student
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.name}</div>
            <p className="text-xs text-muted-foreground">{student.className || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <Progress value={stats.overallProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Courses Enrolled
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCoursesCount}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
