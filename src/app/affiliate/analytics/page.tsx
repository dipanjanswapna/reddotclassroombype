
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Link2, BarChart3, Users } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getUsers, getCourses, getEnrollments } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const EnrollmentTrendsChart = dynamic(() => import('@/components/admin/enrollment-trends-chart').then(mod => mod.EnrollmentTrendsChart), {
    loading: () => <Skeleton className="h-[350px] w-full" />,
});


export default function AffiliateAnalyticsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    
    const [stats, setStats] = useState({
        signups: 0,
        earnings: 0,
    });
    
    const [topReferrals, setTopReferrals] = useState<{ course: string; signups: number; earnings: string }[]>([]);
    const [signupData, setSignupData] = useState<{ name: string; total: number }[]>([]);

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchAnalyticsData = async () => {
            try {
                const [allUsers, allCourses, allEnrollments] = await Promise.all([
                    getUsers(),
                    getCourses(),
                    getEnrollments()
                ]);

                const referredUsers = allUsers.filter(u => u.referredBy === userInfo.uid);
                const referredUserIds = referredUsers.map(u => u.id!);

                const referredEnrollments = allEnrollments.filter(e => referredUserIds.includes(e.userId));

                let totalEarnings = 0;
                const courseStats: { [key: string]: { signups: number, earnings: number } } = {};

                referredEnrollments.forEach(enrollment => {
                    const course = allCourses.find(c => c.id === enrollment.courseId);
                    if (course) {
                        const price = parseFloat(course.price.replace(/[^0-9.]/g, '')) || 0;
                        const commission = price * 0.10; // Assume 10% commission
                        totalEarnings += commission;

                        if (!courseStats[course.id!]) {
                            courseStats[course.id!] = { signups: 0, earnings: 0 };
                        }
                        courseStats[course.id!].signups += 1;
                        courseStats[course.id!].earnings += commission;
                    }
                });

                setStats({
                    signups: referredUsers.length,
                    earnings: totalEarnings
                });

                const topCourses = Object.entries(courseStats)
                    .map(([courseId, data]) => {
                        const course = allCourses.find(c => c.id === courseId);
                        return {
                            course: course?.title || 'Unknown Course',
                            signups: data.signups,
                            earnings: `৳${data.earnings.toFixed(2)}`
                        }
                    })
                    .sort((a,b) => parseFloat(b.earnings.replace('৳','')) - parseFloat(a.earnings.replace('৳','')))
                    .slice(0, 5);
                
                setTopReferrals(topCourses);
                
                const monthlySignups: { [key: string]: number } = {};
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                referredUsers.forEach(user => {
                    const joinDate = safeToDate(user.joined);
                    if (!isNaN(joinDate.getTime())) {
                        const month = joinDate.getMonth();
                        const year = joinDate.getFullYear();
                        const key = `${year}-${monthNames[month]}`;
                        if (!monthlySignups[key]) monthlySignups[key] = 0;
                        monthlySignups[key]++;
                    }
                });
                
                 const chartData = Object.entries(monthlySignups).map(([key, total]) => ({
                    name: key.split('-')[1],
                    total,
                }));
                setSignupData(chartData);


            } catch (err) {
                console.error(err);
                toast({ title: 'Error', description: 'Could not load analytics data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [userInfo, authLoading, toast]);
    
    if (loading || authLoading) {
        return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner /></div>;
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Referral Analytics</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your link performance and optimize your strategy.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sign-ups</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats.signups}</div>
                    <p className="text-xs text-muted-foreground">Via your referral links</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.earnings.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All-time earnings from referrals</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Sign-ups Over Time</CardTitle>
                <CardDescription>New user sign-ups from your referrals over time.</CardDescription>
            </CardHeader>
            <CardContent>
               <EnrollmentTrendsChart data={signupData} />
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Top Performing Referrals</CardTitle>
                <CardDescription>Your most successful course referral links by generated revenue.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Sign-ups</TableHead>
                            <TableHead className="text-right">Earnings</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topReferrals.length > 0 ? topReferrals.map((referral) => (
                            <TableRow key={referral.course}>
                                <TableCell className="font-medium">{referral.course}</TableCell>
                                <TableCell>{referral.signups}</TableCell>
                                <TableCell className="text-right font-bold">{referral.earnings}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No referral data yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
