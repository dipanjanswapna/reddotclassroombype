
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/auth-context';
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { Course, Enrollment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

type Transaction = {
  id: string;
  courseName: string;
  amount: string;
  date: string;
  status: string;
};

export default function GuardianPaymentsPage() {
  const { userInfo: guardian, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchPaymentHistory = async () => {
      if (!guardian || !guardian.linkedStudentId) {
        setLoading(false);
        return;
      }
      try {
        const [allCourses, enrollments] = await Promise.all([
          getCourses(),
          getEnrollmentsByUserId(guardian.linkedStudentId),
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
        toast({ title: 'Error', description: "Could not load payment history.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentHistory();
  }, [authLoading, guardian, toast]);
  
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
          A record of all transactions for your child on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Payment history for all course enrollments.</CardDescription>
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
                        No payment history found for the linked student.
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
