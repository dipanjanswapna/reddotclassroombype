
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/auth-context';
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { Course, Enrollment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Wallet } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Payment History',
    description: 'A record of all your transactions on the platform.',
};

type Transaction = {
  id: string;
  courseName: string;
  amount: string;
  date: string;
  status: string;
};

export default function PaymentsPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userInfo) {
        if (!authLoading) setLoading(false);
        return;
    };

    const fetchPaymentHistory = async () => {
      try {
        const [allCourses, enrollments] = await Promise.all([
          getCourses(),
          getEnrollmentsByUserId(userInfo.uid),
        ]);
        
        const history: Transaction[] = enrollments.map(enrollment => {
          const course = allCourses.find(c => c.id === enrollment.courseId);
          return {
            id: enrollment.id!,
            courseName: course?.title || 'Unknown Course',
            amount: course?.price || 'N/A',
            date: format(enrollment.enrollmentDate.toDate(), 'PPP'),
            status: 'Paid',
          };
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTransactions(history);

      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        toast({ title: 'Error', description: "Could not load your payment history.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentHistory();
  }, [authLoading, userInfo, toast]);
  
  if (loading || authLoading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
              <LoadingSpinner className="w-12 h-12" />
          </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A record of all your transactions on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>My Transactions</CardTitle>
            <CardDescription>Payment history for all your course enrollments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? transactions.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono max-w-24 truncate">{invoice.id}</TableCell>
                  <TableCell className="font-medium">{invoice.courseName}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="accent">{invoice.status}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Wallet className="w-8 h-8" />
                            <span>No payment history found.</span>
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
