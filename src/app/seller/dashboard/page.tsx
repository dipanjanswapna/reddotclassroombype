
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  BarChart,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Target,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCourses, getOrganizationByUserId, getEnrollments } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function SellerDashboardPage() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [stats, setStats] = useState({
        courseCount: 0,
        studentCount: 0,
        totalRevenue: 0,
        averageCompletionRate: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) return;

        async function fetchDashboardData() {
            try {
                const organization = await getOrganizationByUserId(userInfo.uid);
                if (!organization) {
                    toast({ title: 'Error', description: 'Could not find your organization details.', variant: 'destructive' });
                    setLoading(false);
                    return;
                }
                
                const [allCourses, allEnrollments] = await Promise.all([
                    getCourses(),
                    getEnrollments(),
                ]);

                const sellerCourses = allCourses.filter(c => c.organizationId === organization.id);
                const sellerCourseIds = sellerCourses.map(c => c.id!);
                const sellerEnrollments = allEnrollments.filter(e => sellerCourseIds.includes(e.courseId));

                const totalStudents = new Set(sellerEnrollments.map(e => e.userId)).size;

                const totalRevenue = sellerEnrollments.reduce((acc, enrollment) => {
                    const course = sellerCourses.find(c => c.id === enrollment.courseId);
                    const price = parseFloat(course?.price.replace(/[^0-9.]/g, '') || '0');
                    return acc + price;
                }, 0);

                const averageCompletionRate = sellerEnrollments.length > 0 
                    ? Math.round(sellerEnrollments.reduce((sum, e) => sum + e.progress, 0) / sellerEnrollments.length)
                    : 0;

                setStats({
                    courseCount: sellerCourses.length,
                    studentCount: totalStudents,
                    totalRevenue,
                    averageCompletionRate,
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
    <div className="px-1 py-4 md:py-8 space-y-10">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border-l-4 border-indigo-600 pl-4"
        >
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
            Partner <span className="text-indigo-600">Dashboard</span>
            </h1>
            <p className="mt-2 text-sm md:text-lg text-muted-foreground font-medium">
            Analyze sales performance and student growth.
            </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">{stats.studentCount}</div>
                    <Users className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-cyan-600 to-blue-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Active Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">{stats.courseCount}</div>
                    <BookOpen className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">৳{stats.totalRevenue.toLocaleString()}</div>
                    <DollarSign className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-violet-600 to-purple-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Avg. Completion</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">{stats.averageCompletionRate}%</div>
                    <div className="mt-3">
                        <Progress value={stats.averageCompletionRate} className="h-1 bg-white/20 [&>div]:bg-white" />
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
                <CardHeader className="bg-indigo-600/5 p-6 border-b border-black/5">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-600"/>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Sales Strategy</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
                            <Target className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-xs uppercase tracking-tight">Growth Insight</h4>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">Your "Exam Batch" courses are currently seeing a 40% higher conversion rate. Consider expanding these offerings.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-widest border-indigo-600/20 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                        View Detailed Reports
                    </Button>
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
                <CardHeader className="bg-indigo-600/5 p-6 border-b border-black/5">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-indigo-600"/>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Organization Profile</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-20 w-20 rounded-2xl bg-muted animate-pulse flex items-center justify-center font-black text-xl">
                            {userInfo?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-lg uppercase tracking-tight">{userInfo?.name}</h3>
                            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-indigo-600/20 text-indigo-600">Verified Partner</Badge>
                        </div>
                        <Button asChild className="w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20">
                            <Link href="/seller/branding">Edit Brand Settings</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
