
'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Link2, MousePointerClick, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { getUsers, getCourses, getEnrollments } from '@/lib/firebase/firestore';
import { User, Course, Enrollment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';

export default function AffiliateDashboardPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        earnings: 0,
        referrals: 0,
        clicks: 1234, // Mock data, as click tracking is complex
        conversionRate: "2.03%" // Mock data
    });
    const [recentReferrals, setRecentReferrals] = useState<User[]>([]);

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
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
                referredEnrollments.forEach(enrollment => {
                    const course = allCourses.find(c => c.id === enrollment.courseId);
                    if (course) {
                        const price = parseFloat(course.price.replace(/[^0-9.]/g, '')) || 0;
                        totalEarnings += price * 0.10; // Assume 10% commission
                    }
                });

                setStats(prev => ({
                    ...prev,
                    earnings: totalEarnings,
                    referrals: referredUsers.length
                }));
                
                setRecentReferrals(referredUsers.sort((a,b) => safeToDate(b.joined).getTime() - safeToDate(a.joined).getTime()).slice(0, 5));

            } catch (err) {
                console.error(err);
                toast({ title: 'Error', description: 'Could not load dashboard data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userInfo, authLoading, toast]);
    
    if (loading || authLoading) {
        return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tight">
                    Welcome, {userInfo?.name}!
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Here's a summary of your affiliate performance.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.earnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">All-time earnings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.referrals}</div>
                        <p className="text-xs text-muted-foreground">Successful sign-ups</p>
                    </CardContent>
                </Card>
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
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.conversionRate}</div>
                        <p className="text-xs text-muted-foreground">(Mock Data)</p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Referral Activity</CardTitle>
                    <CardDescription>A log of the most recent users who signed up using your links.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentReferrals.map(referral => (
                                <TableRow key={referral.id}>
                                    <TableCell className="font-medium">{referral.name} ({referral.email})</TableCell>
                                    <TableCell><Badge variant="outline">{referral.role}</Badge></TableCell>
                                    <TableCell>{formatDistanceToNow(safeToDate(referral.joined), { addSuffix: true })}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
