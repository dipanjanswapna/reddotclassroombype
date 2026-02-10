
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  BarChart,
  Target,
  Trophy,
  Activity,
  CalendarDays,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCourses, getEnrollmentsByUserId, getUser } from '@/lib/firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
            <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-background">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    if (!student) {
      return (
          <div className="px-1 py-4 md:py-8 space-y-8">
             <div className="border-l-4 border-purple-600 pl-4">
                <h1 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">Guardian Dashboard</h1>
                <p className="mt-2 text-muted-foreground font-medium">Link your child's account to monitor their progress.</p>
             </div>
             <Card className="rounded-[25px] border-dashed border-2 border-primary/10 p-12 text-center bg-muted/20">
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-primary opacity-20" />
                <p className="text-muted-foreground font-bold">No student is currently linked to your account.</p>
                <p className="text-sm text-muted-foreground mt-2">Please ask your child to send an invitation from their portal's Guardian page.</p>
             </Card>
          </div>
      );
    }

  return (
    <div className="px-1 py-4 md:py-8 space-y-10">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border-l-4 border-purple-600 pl-4"
        >
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
            Parental <span className="text-purple-600">Dashboard</span>
            </h1>
            <p className="mt-2 text-sm md:text-lg text-muted-foreground font-medium">
            Real-time snapshot of {student.name}'s academic journey.
            </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-card overflow-hidden group">
                <CardHeader className="bg-purple-600/5 p-5 border-b border-black/5">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Student Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center font-black text-xl text-purple-600">
                            {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase tracking-tight">{student.name}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase">{student.className || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-card overflow-hidden group">
                <CardHeader className="bg-emerald-600/5 p-5 border-b border-black/5">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-black text-foreground">{stats.overallProgress}%</span>
                        <TrendingUp className="h-5 w-5 text-emerald-600 mb-1" />
                    </div>
                    <Progress value={stats.overallProgress} className="h-1.5 bg-muted shadow-inner [&>div]:bg-emerald-500" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-card overflow-hidden group">
                <CardHeader className="bg-blue-600/5 p-5 border-b border-black/5">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Active Courses</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex justify-between items-end">
                        <span className="text-3xl font-black text-foreground">{stats.enrolledCoursesCount}</span>
                        <BookOpen className="h-5 w-5 text-blue-600 mb-1" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Active enrollments</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
                <CardHeader className="bg-purple-600/5 p-6 border-b border-black/5">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-600"/>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Recent Activity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <ul className="space-y-4">
                        <li className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-black/5">
                            <div className="p-2 rounded-lg bg-white shadow-sm"><CalendarDays className="w-4 h-4 text-primary"/></div>
                            <div className="space-y-0.5">
                                <p className="font-black text-[10px] uppercase tracking-tight">Last Attendance Recorded</p>
                                <p className="text-xs font-medium text-muted-foreground">Successfully logged for today's session.</p>
                            </div>
                        </li>
                        <li className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-black/5">
                            <div className="p-2 rounded-lg bg-white shadow-sm"><Trophy className="w-4 h-4 text-amber-500"/></div>
                            <div className="space-y-0.5">
                                <p className="font-black text-[10px] uppercase tracking-tight">Recent Grade Published</p>
                                <p className="text-xs font-medium text-muted-foreground">Physics Quiz: Secured 95% Marks.</p>
                            </div>
                        </li>
                    </ul>
                    <Button asChild variant="outline" className="w-full mt-6 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest border-purple-600/20 text-purple-600 hover:bg-purple-600 hover:text-white transition-all">
                        <Link href="/guardian/progress">Detailed Reports <ChevronRight className="ml-1 h-3 w-3"/></Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
                <CardHeader className="bg-purple-600/5 p-6 border-b border-black/5">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600"/>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Academic Goals</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Target Score</span>
                                <Badge className="bg-purple-100 text-purple-700 border-none font-black text-[9px] uppercase tracking-widest">GPA 5.0</Badge>
                            </div>
                            <Progress value={85} className="h-1.5 bg-muted [&>div]:bg-purple-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Course Completion</span>
                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest">ON TRACK</Badge>
                            </div>
                            <Progress value={60} className="h-1.5 bg-muted [&>div]:bg-emerald-500" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/20 p-4 justify-center border-t border-black/5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Syncing live with RDC Learning Cloud</p>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
