
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
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { Link2, MousePointerClick, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getUsers, getCourses, getEnrollments } from '@/lib/firebase/firestore';
import { User, Course, Enrollment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

const mockChartData = [
    { date: 'Jul 1', Clicks: 150, Signups: 5 },
    { date: 'Jul 2', Clicks: 180, Signups: 8 },
    { date: 'Jul 3', Clicks: 220, Signups: 7 },
    { date: 'Jul 4', Clicks: 250, Signups: 12 },
    { date: 'Jul 5', Clicks: 210, Signups: 10 },
    { date: 'Jul 6', Clicks: 300, Signups: 15 },
    { date: 'Jul 7', Clicks: 280, Signups: 14 },
];

export default function AffiliateAnalyticsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    
    const [stats, setStats] = useState({
        clicks: 1234, // This remains mock as click tracking is complex
        signups: 0,
        earnings: 0,
        conversionRate: "2.03%", // Mock
    });
    
    const [topReferrals, setTopReferrals] = useState<{ course: string; clicks: number; signups: number; earnings: string }[]>([]);

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

                setStats(prev => ({
                    ...prev,
                    signups: referredUsers.length,
                    earnings: totalEarnings
                }));

                const topCourses = Object.entries(courseStats)
                    .map(([courseId, data]) => {
                        const course = allCourses.find(c => c.id === courseId);
                        return {
                            course: course?.title || 'Unknown Course',
                            clicks: data.signups * 25, // Mock clicks based on signups
                            signups: data.signups,
                            earnings: `৳${data.earnings.toFixed(2)}`
                        }
                    })
                    .sort((a,b) => parseFloat(b.earnings.replace('৳','')) - parseFloat(a.earnings.replace('৳','')))
                    .slice(0, 5);
                
                setTopReferrals(topCourses);

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
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.clicks.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">(Mock Data)</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sign-ups</CardTitle>
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats.signups}</div>
                    <p className="text-xs text-muted-foreground">Via your referral links</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.conversionRate}</div>
                    <p className="text-xs text-muted-foreground">(Mock Data)</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.earnings.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">This month's earnings</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>Clicks vs. Sign-ups in the last 7 days. (Mock Data)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Line yAxisId="left" type="monotone" dataKey="Clicks" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="Signups" stroke="hsl(var(--accent))" strokeDasharray="5 5"/>
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Top Performing Referrals</CardTitle>
                <CardDescription>Your most successful course referral links.</CardDescription>
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
                        {topReferrals.map((referral) => (
                            <TableRow key={referral.course}>
                                <TableCell className="font-medium">{referral.course}</TableCell>
                                <TableCell>{referral.signups}</TableCell>
                                <TableCell className="text-right font-bold">{referral.earnings}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
