
'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Link2, Users, TrendingUp, Sparkles, Award, Wallet, ArrowRight, UserPlus } from 'lucide-react';
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
import { motion } from 'framer-motion';
import Link from 'next/link';

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
                
                setRecentReferrals([...referredUsers].sort((a,b) => safeToDate(b.joined).getTime() - safeToDate(a.joined).getTime()).slice(0, 5));

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
        <div className="px-1 py-4 md:py-8 space-y-10">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border-l-4 border-cyan-600 pl-4"
            >
                <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
                Affiliate <span className="text-cyan-600">Empire</span>
                </h1>
                <p className="mt-2 text-sm md:text-lg text-muted-foreground font-medium">
                Track your conversions and build your revenue stream.
                </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-cyan-600 to-blue-500 text-white overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">৳{stats.earnings.toLocaleString()}</div>
                        <Wallet className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>

                <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Conversions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.referrals}</div>
                        <UserPlus className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>

                <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">Elite</div>
                        <Award className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>

                <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-orange-500 to-yellow-400 text-white overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Network Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">Top 5%</div>
                        <TrendingUp className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>
            </div>

             <Card className="rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
                <CardHeader className="bg-cyan-600/5 p-5 border-b border-black/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-600" />
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Recent Conversions</CardTitle>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="h-8 rounded-xl font-black uppercase text-[9px] tracking-widest text-cyan-600 hover:bg-cyan-600/10">
                            <Link href="/affiliate/analytics">Full Stats <ArrowRight className="ml-1 h-3 w-3"/></Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-black/5">
                                <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">New User</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Membership</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-right px-6">Registered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentReferrals.length > 0 ? recentReferrals.map(referral => (
                                <TableRow key={referral.id} className="border-black/5 hover:bg-muted/20 transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-bold text-sm uppercase tracking-tight">{referral.name}</div>
                                        <div className="text-[10px] font-medium text-muted-foreground">{referral.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-cyan-600/20 text-cyan-600 px-2.5 h-5">
                                            {referral.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right px-6 text-[10px] font-bold text-muted-foreground">
                                        {formatDistanceToNow(safeToDate(referral.joined), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <Link2 className="w-12 h-12 mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Share your links to see conversions</p>
                                        </div>
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
