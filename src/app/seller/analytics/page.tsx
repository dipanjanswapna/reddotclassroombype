
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OverviewChart } from '@/components/admin/overview-chart';
import { useAuth } from '@/context/auth-context';
import { getOrganizationByUserId, getCourses, getEnrollments } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Course, Enrollment, Organization } from '@/lib/types';
import { BookOpen, DollarSign, Users } from 'lucide-react';
import { safeToDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function SellerAnalyticsPage() {
    const { userInfo } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalStudents: 0,
        totalCourses: 0,
    });
    const [revenueData, setRevenueData] = useState<{ name: string; total: number }[]>([]);
    const [topCourses, setTopCourses] = useState<{ title: string; enrollments: number; revenue: number }[]>([]);

    useEffect(() => {
        if (!userInfo) return;

        async function fetchData() {
            try {
                const organization = await getOrganizationByUserId(userInfo.uid);
                if (!organization) {
                    toast({ title: "Error", description: "Could not find your organization details.", variant: "destructive" });
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

                // Calculate stats
                const totalStudents = new Set(sellerEnrollments.map(e => e.userId)).size;
                const totalCourses = sellerCourses.length;
                let totalRevenue = 0;
                
                const monthlyRevenue: { [key: string]: number } = {};
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                const courseEnrollmentCounts: { [key: string]: number } = {};
                const courseRevenue: { [key: string]: number } = {};

                sellerEnrollments.forEach(enrollment => {
                    const course = sellerCourses.find(c => c.id === enrollment.courseId);
                    if (course) {
                        const price = parseFloat(course.price.replace(/[^0-9.]/g, '')) || 0;
                        totalRevenue += price;

                        // For chart
                        const enrollmentDate = safeToDate(enrollment.enrollmentDate);
                        if (!isNaN(enrollmentDate.getTime())) {
                            const month = enrollmentDate.getMonth();
                            const year = enrollmentDate.getFullYear();
                            const key = `${year}-${monthNames[month]}`;
                            if (!monthlyRevenue[key]) monthlyRevenue[key] = 0;
                            monthlyRevenue[key] += price;
                        }

                        // For top courses
                        courseEnrollmentCounts[course.id!] = (courseEnrollmentCounts[course.id!] || 0) + 1;
                        courseRevenue[course.id!] = (courseRevenue[course.id!] || 0) + price;
                    }
                });

                setStats({ totalRevenue, totalStudents, totalCourses });
                
                const revenueChartData = Object.entries(monthlyRevenue).map(([key, total]) => ({
                    name: key.split('-')[1],
                    total,
                }));
                setRevenueData(revenueChartData);

                const sortedTopCourses = Object.keys(courseEnrollmentCounts)
                    .map(courseId => ({
                        title: sellerCourses.find(c => c.id === courseId)?.title || 'Unknown Course',
                        enrollments: courseEnrollmentCounts[courseId],
                        revenue: courseRevenue[courseId]
                    }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                setTopCourses(sortedTopCourses);

            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
                toast({ title: 'Error', description: 'Could not load analytics data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [userInfo, toast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Sales Analytics
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    An overview of your organization's sales performance.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">BDT {stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">All-time earnings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Unique students enrolled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">Your active courses</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue generated from your courses.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={revenueData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Courses</CardTitle>
                        <CardDescription>Your best-selling courses by revenue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                    <TableHead className="text-right">Enrollments</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topCourses.map(course => (
                                    <TableRow key={course.title}>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell className="text-right">BDT {course.revenue.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{course.enrollments}</TableCell>
                                    </TableRow>
                                ))}
                                {topCourses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">No sales data yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
