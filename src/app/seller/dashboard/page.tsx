
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  BarChart,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCourses, getOrganizationByUserId, getEnrollments } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';

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
    <div className="space-y-10 md:space-y-14">
        <div className="text-center sm:text-left space-y-2">
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                Seller Dashboard
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Here's an overview of your organization's performance.</p>
            <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glassmorphism-card border-primary/20 bg-primary/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Total Students</CardTitle>
                    <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-primary tracking-tighter">{stats.studentCount}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Unique course learners</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-blue-500/20 bg-blue-500/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Active Courses</CardTitle>
                    <BookOpen className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-blue-600 tracking-tighter">{stats.courseCount}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Published online tracks</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-accent/20 bg-accent/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-accent-foreground">Total Revenue</CardTitle>
                    <DollarSign className="h-5 w-5 text-accent-foreground group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-accent-foreground tracking-tighter">৳{stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">All-time platform sales</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-orange-500/20 bg-orange-500/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-orange-600">Completion Rate</CardTitle>
                    <BarChart className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-orange-600 tracking-tighter">{stats.averageCompletionRate}%</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Across all tracks</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
