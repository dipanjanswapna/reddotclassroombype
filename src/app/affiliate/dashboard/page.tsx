'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Link2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { getUsers, getCourses, getEnrollments } from '@/lib/firebase/firestore';
import type { User, Course, Enrollment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';

/**
 * @fileOverview Polished Affiliate Dashboard.
 * Focus on referral conversion and all-time commissions.
 */
export default function AffiliateDashboardPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        earnings: 0,
        referrals: 0,
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

                setStats({
                    earnings: totalEarnings,
                    referrals: referredUsers.length
                });
                
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
        <div className="space-y-10 md:space-y-14">
            <div className="text-center sm:text-left space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                    Partner Program
                </h1>
                <p className="text-lg text-muted-foreground font-medium">Welcome, {userInfo?.name}! Track your referral performance.</p>
                <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glassmorphism-card border-primary/20 bg-primary/5 shadow-xl rounded-[2rem] overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Commission Balance</CardTitle>
                        <DollarSign className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-primary tracking-tighter">৳{stats.earnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Total earned commissions</p>
                    </CardContent>
                </Card>
                <Card className="glassmorphism-card border-blue-500/20 bg-blue-500/5 shadow-xl rounded-[2rem] overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Total Conversions</CardTitle>
                        <Users className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-blue-600 tracking-tighter">{stats.referrals}</div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Verified student sign-ups</p>
                    </CardContent>
                </Card>
            </div>

             <Card className="rounded-[2.5rem] border-primary/10 shadow-xl overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
                    <CardTitle className="font-black uppercase tracking-tight flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary"/>
                        Recent Referrals
                    </CardTitle>
                    <CardDescription className="font-medium">The most recent students who joined using your unique link.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-foreground">User</TableHead>
                                    <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-foreground">Role</TableHead>
                                    <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest text-foreground">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-primary/5">
                                {recentReferrals.length > 0 ? recentReferrals.map(referral => (
                                    <TableRow key={referral.id} className="hover:bg-primary/5 transition-colors">
                                        <TableCell className="px-8 py-6 font-bold">{referral.name} ({referral.email})</TableCell>
                                        <TableCell className="px-8 py-6">
                                            <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest rounded-lg">{referral.role}</Badge>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-right text-muted-foreground text-xs font-bold">{formatDistanceToNow(safeToDate(referral.joined), { addSuffix: true })}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground font-medium px-8">
                                            No referral activity yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
