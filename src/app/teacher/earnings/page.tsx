
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
import { useToast } from '@/components/ui/use-toast';
import { getCourses, getInstructorByUid, getEnrollments } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';

type Transaction = {
  id: string;
  date: string;
  course: string;
  amount: string;
  status: string;
};

export default function TeacherEarningsPage() {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!userInfo) return;

    async function fetchData() {
      try {
        const instructor = await getInstructorByUid(userInfo.uid);
        if (!instructor) {
          toast({ title: 'Error', description: 'Could not find instructor profile.', variant: 'destructive' });
          return;
        }

        const allCourses = await getCourses();
        const allEnrollments = await getEnrollments();

        const teacherCourses = allCourses.filter(c =>
          c.instructors?.some(i => i.slug === instructor.slug)
        );
        const teacherCourseIds = teacherCourses.map(c => c.id!);

        const teacherEnrollments = allEnrollments.filter(e =>
          teacherCourseIds.includes(e.courseId)
        );

        let totalRevenue = 0;
        let thisMonthRevenue = 0;
        let lastMonthRevenue = 0;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const transactionData = teacherEnrollments
          .map(enrollment => {
            const course = teacherCourses.find(c => c.id === enrollment.courseId);
            if (!course) return null;

            const price = parseFloat(course.price.replace(/[^0-9.]/g, '')) || 0;
            totalRevenue += price;

            const enrollmentDate = enrollment.enrollmentDate.toDate();
            if (enrollmentDate >= startOfMonth) {
              thisMonthRevenue += price;
            } else if (enrollmentDate >= startOfLastMonth && enrollmentDate <= endOfLastMonth) {
              lastMonthRevenue += price;
            }

            return {
              id: enrollment.id!,
              date: enrollmentDate.toLocaleDateString(),
              course: course.title,
              amount: `৳${price.toFixed(2)}`,
              status: 'Cleared' // Simplified status for now
            };
          })
          .filter(Boolean) as Transaction[];

        transactionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(transactionData);

        setStats({
          totalRevenue,
          thisMonthRevenue,
          lastMonthRevenue,
        });

      } catch (error) {
        console.error("Failed to fetch earnings:", error);
        toast({ title: "Error", description: "Could not load earnings data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userInfo, toast]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Earnings</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your course revenue and view your payment history.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All-time earnings</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.thisMonthRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Current month's earnings</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.thisMonthRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Next payout: (TBD)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats.lastMonthRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Previous month's earnings</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>A log of your most recent course sales.</CardDescription>
                </div>
                <Button variant="outline"><Download className="mr-2"/> Export History</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Your Earnings</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell className="font-medium">{transaction.course}</TableCell>
                                <TableCell className="font-bold">{transaction.amount}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={transaction.status === 'Cleared' ? 'accent' : 'warning'}>{transaction.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                         {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No sales transactions yet.
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
