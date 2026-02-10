'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Gift, Users, Copy, Check, Share2, TicketPercent, Award, TrendingUp, Sparkles } from 'lucide-react';
import { Referral } from '@/lib/types';
import { getReferralsByReferrerId } from '@/lib/firebase/firestore';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function StudentReferralsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const referralLink = userInfo?.classRoll ? `${window.location.origin}/signup?ref=${userInfo.classRoll}` : '';

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        async function fetchReferrals() {
            try {
                const data = await getReferralsByReferrerId(userInfo.uid);
                setReferrals(data.sort((a,b) => safeToDate(b.date).getTime() - safeToDate(a.date).getTime()));
            } catch (err) {
                console.error("Failed to fetch referral data:", err);
                toast({ title: "Error", description: "Could not fetch your referral history.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        fetchReferrals();
    }, [userInfo, authLoading, toast]);
    
    const handleCopy = (text: string, type: 'link' | 'code') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'link') {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } else {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
        toast({ title: 'Copied to clipboard!' });
    };

    const totalPointsEarned = useMemo(() => {
        return referrals.reduce((sum, ref) => sum + (ref.rewardedPoints || 0), 0);
    }, [referrals]);

    const totalDiscountsGiven = useMemo(() => {
        return referrals.reduce((sum, ref) => sum + (ref.discountGiven || 0), 0);
    }, [referrals]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="space-y-10 md:space-y-14 pb-10">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 border-l-4 border-primary pl-6"
            >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                    <Sparkles className="w-3 h-3" />
                    Refer & Earn
                </div>
                <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                    Invite Your <span className="text-primary">Friends</span>
                </h1>
                <p className="text-muted-foreground font-medium text-base md:text-lg max-w-2xl">
                    বন্ধুদের RDC-তে আমন্ত্রণ জানান এবং জিতে নিন আকর্ষণীয় সব পুরস্কার ও পয়েন্ট!
                </p>
            </motion.div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                 <Card className="p-6 flex flex-col justify-center items-center text-center space-y-2">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black leading-none">{referrals.length}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total Referrals</p>
                    </div>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center text-center space-y-2">
                    <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black leading-none">{userInfo?.referralPoints || 0}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Current Balance</p>
                    </div>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center text-center space-y-2">
                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black leading-none">{totalPointsEarned}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Lifetime Points</p>
                    </div>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center text-center space-y-2">
                    <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl">
                        <TicketPercent className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black leading-none">৳{totalDiscountsGiven.toLocaleString()}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Friends Saved</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-primary" />
                                Share & Earn
                            </CardTitle>
                            <CardDescription className="font-medium text-xs">আপনার বন্ধুদের আমন্ত্রণ জানাতে নিচের কোড বা লিঙ্কটি ব্যবহার করুন।</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Referral Code</Label>
                                <div className="flex gap-2">
                                    <div className="flex-grow h-12 bg-muted/50 rounded-xl border border-primary/10 flex items-center px-4 font-black text-lg tracking-[0.2em] text-primary">
                                        {userInfo?.classRoll || 'N/A'}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-xl border-primary/10 hover:bg-primary hover:text-white transition-all"
                                        onClick={() => handleCopy(userInfo?.classRoll || '', 'code')}
                                    >
                                        {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Referral Link</Label>
                                <div className="flex gap-2">
                                    <div className="flex-grow h-12 bg-muted/50 rounded-xl border border-primary/10 flex items-center px-4 text-xs font-mono text-muted-foreground truncate">
                                        {referralLink}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-xl border-primary/10 hover:bg-primary hover:text-white transition-all"
                                        onClick={() => handleCopy(referralLink, 'link')}
                                    >
                                        {copiedLink ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-primary/5 p-4 justify-center">
                            <Button asChild variant="link" className="font-black text-[10px] uppercase tracking-widest text-primary p-0 h-auto">
                                <Link href="/student/rewards">Redeem Your Points Now &rarr;</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Referral History</CardTitle>
                            <CardDescription className="font-medium text-xs">আপনার কোড ব্যবহার করে যারা এনরোল করেছে তাদের তালিকা।</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                             <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="border-primary/10">
                                            <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Referred Friend</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Course</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-right px-6">Points</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {referrals.length > 0 ? referrals.map((ref) => (
                                            <TableRow key={ref.id} className="border-primary/10 hover:bg-muted/20 transition-colors">
                                                <TableCell className="px-6 py-4">
                                                    <div className="font-bold text-sm uppercase tracking-tight">{ref.referredUserName}</div>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-accent mt-0.5">
                                                        <TicketPercent className="w-3 h-3" />
                                                        ৳{ref.discountGiven.toFixed(0)} Discount Used
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter max-w-[120px] truncate">{ref.courseName}</Badge>
                                                </TableCell>
                                                <TableCell className="text-[10px] font-bold text-muted-foreground py-4">
                                                    {format(safeToDate(ref.date), 'dd MMM yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right px-6 py-4">
                                                    <Badge variant="accent" className="font-black text-xs">+{ref.rewardedPoints}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-40 text-center">
                                                    <div className="flex flex-col items-center justify-center opacity-30">
                                                        <Users className="w-12 h-12 mb-2" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">No referrals yet</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}