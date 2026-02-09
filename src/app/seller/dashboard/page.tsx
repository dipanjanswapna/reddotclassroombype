
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  BarChart,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight">
            Seller Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Here's an overview of your organization's performance.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                Unique students in your courses
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Active Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.courseCount}</div>
                <p className="text-xs text-muted-foreground">
                Published courses
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">BDT {stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                All-time sales from your courses
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Course Completion Rate
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.averageCompletionRate}%</div>
                <p className="text-xs text-muted-foreground">
                Average across all courses
                </p>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
