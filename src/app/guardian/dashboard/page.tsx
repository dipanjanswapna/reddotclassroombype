'use client';

import { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  BarChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCourses, getEnrollmentsByUserId, getUser } from '@/lib/firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

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
          <div className="space-y-6 max-w-2xl mx-auto text-center py-20">
             <div className="p-6 bg-muted/30 rounded-[2rem] border-2 border-dashed">
                <h1 className="font-headline text-3xl font-black text-muted-foreground uppercase">No Student Linked</h1>
                <p className="mt-4 text-muted-foreground font-medium">Please ask your child to send an invitation from their portal's Guardian page.</p>
             </div>
          </div>
      );
    }

  return (
    <div className="space-y-10 md:space-y-14">
        <div className="text-center sm:text-left space-y-2">
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                Guardian Dashboard
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Monitor your child's academic progress.</p>
            <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glassmorphism-card border-primary/20 bg-primary/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Student</CardTitle>
                    <User className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-primary tracking-tight">{student.name}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{student.className || 'N/A'}</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-accent/20 bg-accent/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-accent-foreground">Overall Progress</CardTitle>
                    <BarChart className="h-5 w-5 text-accent-foreground group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-accent-foreground tracking-tighter">{stats.overallProgress}%</div>
                    <Progress value={stats.overallProgress} className="mt-3 h-1.5 [&>div]:bg-accent" />
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-blue-500/20 bg-blue-500/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Courses Enrolled</CardTitle>
                    <BookOpen className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-blue-600 tracking-tighter">{stats.enrolledCoursesCount}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Active enrollments</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
