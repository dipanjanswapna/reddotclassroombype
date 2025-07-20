

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getReferrals, getUsers } from '@/lib/firebase/firestore';
import { Referral, User } from '@/lib/types';
import { safeToDate } from '@/lib/utils';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight, TicketPercent, Gift, Users } from 'lucide-react';

type ReferralWithNames = Referral & {
  referrerName?: string;
};

export default function ReferralsReportPage() {
    const [referrals, setReferrals] = useState<ReferralWithNames[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        async function fetchData() {
            try {
                const [referralsData, usersData] = await Promise.all([
                    getReferrals(),
                    getUsers(),
                ]);
                
                const usersMap = new Map(usersData.map(u => [u.uid, u.name]));
                
                const referralsWithNames = referralsData.map(r => ({
                    ...r,
                    referrerName: usersMap.get(r.referrerId) || 'Unknown Referrer',
                })).sort((a,b) => safeToDate(b.date).getTime() - safeToDate(a.date).getTime());

                setReferrals(referralsWithNames);
                setUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch referral data:", error);
                toast({ title: "Error", description: "Failed to load referral report.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const totalPointsAwarded = useMemo(() => {
        return referrals.reduce((sum, ref) => sum + (ref.rewardedPoints || 0), 0);
    }, [referrals]);
    
     const totalDiscountGiven = useMemo(() => {
        return referrals.reduce((sum, ref) => sum + (ref.discountGiven || 0), 0);
    }, [referrals]);

    if(loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Referral Report</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    A complete log of all referral activities on the platform.
                </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points Awarded</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPointsAwarded.toLocaleString()}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Discount Given</CardTitle>
                        <TicketPercent className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{totalDiscountGiven.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Referral Log</CardTitle>
                    <CardDescription>Detailed history of every referral made.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Referrer</TableHead>
                                <TableHead>Referred User</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referrals.map(ref => (
                                <TableRow key={ref.id}>
                                    <TableCell className="font-medium">{ref.referrerName}</TableCell>
                                    <TableCell>{ref.referredUserName}</TableCell>
                                    <TableCell>{ref.courseName}</TableCell>
                                    <TableCell>{format(safeToDate(ref.date), 'PPP')}</TableCell>
                                    <TableCell className="text-right">
                                       <div className="flex justify-end gap-2 text-xs">
                                           <Badge variant="outline" className="gap-1"><TicketPercent className="h-3 w-3"/>৳{ref.discountGiven.toFixed(2)}</Badge>
                                           <Badge variant="accent" className="gap-1"><Gift className="h-3 w-3"/>+{ref.rewardedPoints}</Badge>
                                       </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    