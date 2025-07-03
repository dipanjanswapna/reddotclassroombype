
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
import { getCourses, getEnrollments, getUsers } from '@/lib/firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';

const mockPayouts = [
    { id: 'p_123', date: '2024-07-15', amount: '৳2,500', method: 'bKash', status: 'Paid' },
    { id: 'p_124', date: '2024-06-15', amount: '৳1,750', method: 'bKash', status: 'Paid' },
];

export default function AffiliatePayoutsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ available: 0, paidOut: 4250 }); // paidOut is mock

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchEarnings = async () => {
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
                
                // For this demo, assume available = total - paidOut
                setStats(prev => ({ ...prev, available: totalEarnings - prev.paidOut }));

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
                    <p className="text-xs text-muted-foreground">All-time earnings paid (mock data)</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>A record of all payouts you have received (mock data).</CardDescription>
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
                        {mockPayouts.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell className="font-mono">{payout.id}</TableCell>
                                <TableCell>{payout.date}</TableCell>
                                <TableCell className="font-medium">{payout.amount}</TableCell>
                                <TableCell>{payout.method}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={payout.status === 'Paid' ? 'accent' : 'secondary'}>{payout.status}</Badge>
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
