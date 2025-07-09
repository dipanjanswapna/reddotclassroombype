
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Banknote, DollarSign, Download, Landmark } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getCourses, getEnrollments, getUsers, getPayoutsByUserId } from '@/lib/firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Payout } from '@/lib/types';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';

export default function AffiliatePayoutsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [stats, setStats] = useState({ available: 0, paidOut: 0 });

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchEarnings = async () => {
            try {
                const [allUsers, allCourses, allEnrollments, fetchedPayouts] = await Promise.all([
                    getUsers(),
                    getCourses(),
                    getEnrollments(),
                    getPayoutsByUserId(userInfo.uid)
                ]);

                setPayouts(fetchedPayouts.sort((a, b) => b.payoutDate.toMillis() - a.payoutDate.toMillis()));
                
                const totalPaidOut = fetchedPayouts.reduce((acc, p) => p.status === 'Completed' ? acc + p.amount : acc, 0);

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
                    available: totalEarnings - totalPaidOut, 
                    paidOut: totalPaidOut 
                });

            } catch (err) {
                 console.error(err);
                toast({ title: 'Error', description: 'Could not load earnings data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, [userInfo, authLoading, toast]);
    
    if (loading || authLoading) {
        return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner /></div>;
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Payout History</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your earnings and view your payment history.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.available.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Minimum payout: ৳1,000</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.paidOut.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All-time earnings paid</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>A record of all payouts you have received.</CardDescription>
                </div>
                <Button variant="outline"><Download className="mr-2"/> Export History</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payouts.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell className="font-mono">{payout.transactionId || payout.id}</TableCell>
                                <TableCell>{format(safeToDate(payout.payoutDate), 'PPP')}</TableCell>
                                <TableCell className="font-medium">৳{payout.amount.toFixed(2)}</TableCell>
                                <TableCell>{payout.method}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={payout.status === 'Completed' ? 'accent' : 'secondary'}>{payout.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                         {payouts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No payout history found.
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
