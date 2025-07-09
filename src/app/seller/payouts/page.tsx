
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
import { getCourses, getEnrollments, getOrganizationByUserId } from '@/lib/firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { safeToDate } from '@/lib/utils';

type Transaction = {
  id: string;
  date: string;
  course: string;
  amount: string;
  status: string;
};

export default function SellerSalesPage() {
    const { userInfo } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ 
        totalRevenue: 0, 
        thisMonthRevenue: 0,
        availableForPayout: 0,
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!userInfo) return;

        async function fetchSalesData() {
            try {
                const organization = await getOrganizationByUserId(userInfo.uid);
                if (!organization) {
                    toast({ title: "Error", description: "Could not find your organization details.", variant: "destructive" });
                    setLoading(false);
                    return;
                }

                const [allCourses, allEnrollments] = await Promise.all([
                    getCourses(),
                    getEnrollments()
                ]);

                const sellerCourses = allCourses.filter(c => c.organizationId === organization.id);
                const sellerCourseIds = sellerCourses.map(c => c.id!);
                const sellerEnrollments = allEnrollments.filter(e => sellerCourseIds.includes(e.courseId));
                
                let totalRevenue = 0;
                let thisMonthRevenue = 0;
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const recentSales = sellerEnrollments.map(enrollment => {
                    const course = sellerCourses.find(c => c.id === enrollment.courseId);
                    if (!course) return null;
                    
                    const price = parseFloat(course.price.replace(/[^0-9.]/g, '') || '0');
                    totalRevenue += price;
                    
                    const enrollmentDate = safeToDate(enrollment.enrollmentDate);
                    if (enrollmentDate >= startOfMonth) {
                        thisMonthRevenue += price;
                    }

                    return {
                        id: enrollment.id!,
                        date: enrollmentDate.toLocaleDateString(),
                        course: course.title,
                        amount: `৳${price.toFixed(2)}`,
                        status: 'Cleared'
                    };
                }).filter(Boolean) as Transaction[];

                recentSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setTransactions(recentSales);

                setStats({
                    totalRevenue,
                    thisMonthRevenue,
                    availableForPayout: thisMonthRevenue, // Simplified logic, can be adjusted
                });

            } catch (error) {
                console.error("Failed to fetch sales data:", error);
                toast({ title: 'Error', description: 'Could not load sales data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        }
        fetchSalesData();
    }, [userInfo, toast]);
    
    if (loading) {
        return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner /></div>;
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Sales & Payouts</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your organization's sales and earnings.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All-time sales</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month's Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.thisMonthRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Current month's sales</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.availableForPayout.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Next payout: (TBD)</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Sales Transactions</CardTitle>
                    <CardDescription>A record of all your organization's course sales.</CardDescription>
                </div>
                <Button variant="outline"><Download className="mr-2"/> Export History</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className="font-mono max-w-24 truncate">{transaction.id}</TableCell>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell className="font-medium">{transaction.course}</TableCell>
                                <TableCell className="font-bold">{transaction.amount}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={'accent'}>{transaction.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                         {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No sales history found.
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
