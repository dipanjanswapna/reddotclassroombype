
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Gift, Users, Copy, Check, Share2, TicketPercent } from 'lucide-react';
import { Referral } from '@/lib/types';
import { getReferralsByReferrerId } from '@/lib/firebase/firestore';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function StudentReferralsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const referralLink = userInfo?.referralCode ? `${window.location.origin}/signup?ref=${userInfo.referralCode}` : '';

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
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Referrals</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Invite your friends to RDC and earn rewards!
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.length}</div>
                        <p className="text-xs text-muted-foreground">Successful sign-ups from your link.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points Earned</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userInfo?.referralPoints || 0} Points</div>
                        <p className="text-xs text-muted-foreground">Use points to redeem rewards.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Share2 /> Your Referral Code & Link</CardTitle>
                    <CardDescription>Share your code or link with friends. They will get a discount, and you'll earn points when they enroll!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Your Code</Label>
                        <div className="flex gap-2">
                            <Input value={userInfo?.referralCode || 'N/A'} readOnly />
                            <Button variant="outline" onClick={() => handleCopy(userInfo?.referralCode || '')} disabled={!userInfo?.referralCode}>
                                {copied && userInfo?.referralCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Your Link</Label>
                        <div className="flex gap-2">
                            <Input value={referralLink} readOnly />
                            <Button variant="outline" onClick={() => handleCopy(referralLink)} disabled={!referralLink}>
                               {copied && referralLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Referral History</CardTitle>
                    <CardDescription>A log of all the friends who joined using your code.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Referred Friend</TableHead>
                                <TableHead>Course Enrolled</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Discount Given</TableHead>
                                <TableHead className="text-right">Points Earned</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referrals.length > 0 ? referrals.map((ref) => (
                                <TableRow key={ref.id}>
                                    <TableCell>{ref.referredUserName}</TableCell>
                                    <TableCell>{ref.courseName}</TableCell>
                                    <TableCell>{format(safeToDate(ref.date), 'PPP')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="gap-1">
                                            <TicketPercent className="h-3 w-3" />
                                            ৳{ref.discountGiven.toFixed(2)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="accent">+{ref.rewardedPoints}</Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No referral history yet.
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
