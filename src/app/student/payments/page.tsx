

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
import { getCourses, getEnrollmentsByUserId, getInvoiceByEnrollmentId, getDocument, getUser, getCourse } from '@/lib/firebase/firestore';
import { Course, Enrollment, Invoice } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Wallet, Eye, Loader2 } from 'lucide-react';
import { InvoiceView } from '@/components/invoice-view';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createInvoiceAction } from '@/app/actions/invoice.actions';

type Transaction = Enrollment & {
  courseName: string;
  coursePrice: string;
};

export default function PaymentsPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

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
            ...enrollment,
            courseName: course?.title || 'Unknown Course',
            coursePrice: course?.price || 'N/A',
          };
        }).sort((a,b) => b.enrollmentDate.toDate().getTime() - a.enrollmentDate.toDate().getTime());

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
  
  const handleViewInvoice = async (enrollment: Enrollment) => {
    if (!enrollment.id) return;
    setLoadingInvoice(true);
    setIsInvoiceOpen(true);
    try {
      let invoice = await getInvoiceByEnrollmentId(enrollment.id);
      
      // If invoice doesn't exist, create it on-the-fly
      if (!invoice && userInfo) {
        const course = await getCourse(enrollment.courseId);
        if (course) {
            const creationResult = await createInvoiceAction(enrollment, userInfo, course);
            if (creationResult.success && creationResult.invoiceId) {
                invoice = await getDocument<Invoice>('invoices', creationResult.invoiceId);
            } else {
                throw new Error(creationResult.message || 'Failed to create invoice.');
            }
        }
      }

      if (invoice) {
        setSelectedInvoice(invoice);
      } else {
        toast({ title: 'Error', description: 'Could not find or create the invoice.', variant: 'destructive' });
        setIsInvoiceOpen(false);
      }
    } catch(err: any) {
      toast({ title: 'Error', description: `An error occurred while handling the invoice: ${err.message}`, variant: 'destructive' });
      setIsInvoiceOpen(false);
    } finally {
      setLoadingInvoice(false);
    }
  };

  if (loading || authLoading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
              <LoadingSpinner className="w-12 h-12" />
          </div>
      );
  }

  return (
    <>
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
                  <TableHead>Course Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.courseName}</TableCell>
                    <TableCell>{transaction.coursePrice}</TableCell>
                    <TableCell>{format(transaction.enrollmentDate.toDate(), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.paymentStatus === 'paid' ? 'accent' : 'warning'}>{transaction.paymentStatus || 'Paid'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => handleViewInvoice(transaction)}><Eye className="mr-2 h-4 w-4"/> View Invoice</Button>
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

      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-4xl p-0">
            {loadingInvoice ? (
                <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : selectedInvoice ? (
                <InvoiceView invoice={selectedInvoice} />
            ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
