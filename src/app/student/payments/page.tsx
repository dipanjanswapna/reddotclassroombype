
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId, getOrdersByUserId, getCoursesByIds, getDocument, getCourse } from '@/lib/firebase/firestore';
import type { Enrollment, Order, Course, Invoice } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvoiceView } from '@/components/invoice-view';
import { createInvoiceAction } from '@/app/actions/invoice.actions';
import { useToast } from '@/components/ui/use-toast';

type Transaction = {
  id: string;
  courseName: string;
  date: Date;
  amount: number;
  enrollment: Enrollment;
};

export default function StudentPaymentsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);

    const fetchData = useCallback(async () => {
        if (!userInfo) {
            setLoading(false);
            return;
        }
        
        try {
            const [enrollmentsData, ordersData] = await Promise.all([
                getEnrollmentsByUserId(userInfo.uid),
                getOrdersByUserId(userInfo.uid),
            ]);
            
            if (enrollmentsData.length > 0) {
                const courseIds = [...new Set(enrollmentsData.map(e => e.courseId))];
                const coursesData = await getCoursesByIds(courseIds);
                const coursesMap = new Map(coursesData.map(c => [c.id, c]));

                const processedTransactions = enrollmentsData.map(e => {
                    const course = coursesMap.get(e.courseId);
                    return {
                        id: e.id!,
                        courseName: course?.title || 'Unknown Course',
                        date: safeToDate(e.enrollmentDate),
                        amount: e.totalFee || 0,
                        enrollment: e,
                    };
                }).sort((a,b) => b.date.getTime() - a.date.getTime());
                setTransactions(processedTransactions);
            } else {
                setTransactions([]);
            }
            
            setOrders(ordersData.sort((a, b) => safeToDate(b.createdAt).getTime() - safeToDate(a.createdAt).getTime()));
        } catch (error) {
            console.error("Error fetching payment data:", error);
            toast({ title: 'Error', description: 'Could not load your payment history.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }, [userInfo, toast]);
    
    useEffect(() => {
        if (!authLoading && userInfo) {
            fetchData();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [authLoading, userInfo, fetchData]);
    
    const handleViewInvoice = async (enrollment: Enrollment) => {
        if (!userInfo || !enrollment.id) return;

        setIsInvoiceOpen(true);
        setLoadingInvoice(true);
        setSelectedInvoice(null);
        
        try {
            const course = await getCourse(enrollment.courseId);
            if (!course) {
                throw new Error("Could not find course details to generate invoice.");
            }

            let invoice: Invoice | null = null;
            if(enrollment.invoiceId) {
                invoice = await getDocument<Invoice>('invoices', enrollment.invoiceId);
            }
            
            if (!invoice) {
                invoice = await createInvoiceAction(enrollment, userInfo, course).then(res => res.success && res.invoiceId ? getDocument<Invoice>('invoices', res.invoiceId) : null);
            }

            if (invoice) {
                if (!invoice.courseDetails.communityUrl) {
                    const isCycleEnrollment = !!invoice.courseDetails.cycleName;
                    const cycle = isCycleEnrollment ? course.cycles?.find(c => c.title === invoice.courseDetails.cycleName) : null;
                    const communityUrl = isCycleEnrollment ? cycle?.communityUrl : course.communityUrl;
                    if (communityUrl) {
                        invoice.courseDetails.communityUrl = communityUrl;
                    }
                }
                setSelectedInvoice(invoice);
            } else {
                throw new Error("Invoice could not be loaded or created.");
            }

        } catch (error: any) {
            toast({ title: 'Error', description: `Could not load invoice: ${error.message}`, variant: 'destructive' });
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
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Payment History</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    A record of all your transactions on the platform.
                </p>
            </div>
            
            <Tabs defaultValue="courses">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="courses">Course Enrollments</TabsTrigger>
                    <TabsTrigger value="store">Store Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="courses">
                     <Card>
                        <CardHeader>
                            <CardTitle>Course Enrollment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Invoice</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {transactions.length > 0 ? transactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.courseName}</TableCell>
                                        <TableCell>{format(t.date, 'PPP')}</TableCell>
                                        <TableCell>৳{t.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handleViewInvoice(t.enrollment)}>
                                                <Eye className="mr-2 h-4 w-4"/> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No course enrollments found.</TableCell>
                                    </TableRow>
                                )}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </TabsContent>
                <TabsContent value="store">
                     <Card>
                        <CardHeader>
                            <CardTitle>RDC Store Order History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {orders.length > 0 ? orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono">#{order.id?.slice(0,8)}</TableCell>
                                        <TableCell>{format(safeToDate(order.createdAt), 'PPP')}</TableCell>
                                        <TableCell>৳{order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell><Badge>{order.status}</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No store orders found.</TableCell>
                                    </TableRow>
                                )}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </TabsContent>
            </Tabs>
             <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
                <DialogContent className="max-w-4xl p-0">
                   <div className="max-h-[80vh] overflow-y-auto">
                        {loadingInvoice ? (
                            <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : selectedInvoice ? (
                            <InvoiceView invoice={selectedInvoice} />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
