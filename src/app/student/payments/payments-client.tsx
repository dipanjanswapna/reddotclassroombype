
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getCourse, getDocument, getInvoiceByEnrollmentId } from '@/lib/firebase/firestore';
import type { Enrollment, Order, Invoice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvoiceView } from '@/components/invoice-view';
import { createInvoiceAction, updateInvoiceAction } from '@/app/actions/invoice.actions';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';

type Transaction = {
  id: string;
  courseName: string;
  date: string;
  amount: number;
  enrollment: Enrollment;
};

export type HydratedOrder = Omit<Order, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
}

interface PaymentsClientProps {
    initialTransactions: Transaction[];
    initialOrders: HydratedOrder[];
}

export function PaymentsClient({ initialTransactions, initialOrders }: PaymentsClientProps) {
    const { userInfo } = useAuth();
    const { toast } = useToast();
    
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);

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
            if (enrollment.invoiceId) {
                invoice = await getDocument<Invoice>('invoices', enrollment.invoiceId);
            } else {
                invoice = await getInvoiceByEnrollmentId(enrollment.id);
            }
            
            if (!invoice) {
                const creationResult = await createInvoiceAction(enrollment, userInfo, course);
                 if (creationResult.success && creationResult.invoiceId) {
                    invoice = await getDocument<Invoice>('invoices', creationResult.invoiceId);
                } else {
                    throw new Error(creationResult.message || 'Failed to create invoice.');
                }
            }

            if (invoice) {
                if (!invoice.courseDetails.communityUrl) {
                    const isCycleEnrollment = !!invoice.courseDetails.cycleName;
                    const cycle = isCycleEnrollment ? course.cycles?.find(c => c.title === invoice.courseDetails.cycleName) : null;
                    const communityUrl = isCycleEnrollment ? cycle?.communityUrl : course.communityUrl;
                    if (communityUrl) {
                         const updatedInvoice = { ...invoice, courseDetails: { ...invoice.courseDetails, communityUrl } };
                         await updateInvoiceAction(invoice.id!, { courseDetails: updatedInvoice.courseDetails });
                         setSelectedInvoice(updatedInvoice);
                    } else {
                        setSelectedInvoice(invoice);
                    }
                } else {
                    setSelectedInvoice(invoice);
                }
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

    return (
        <>
            <Tabs defaultValue="courses">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="courses">Course Enrollments</TabsTrigger>
                    <TabsTrigger value="store">Store Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="courses" className="mt-4">
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
                                {initialTransactions.length > 0 ? initialTransactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.courseName}</TableCell>
                                        <TableCell>{format(safeToDate(t.date), 'PPP')}</TableCell>
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
                <TabsContent value="store" className="mt-4">
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
                                {initialOrders.length > 0 ? initialOrders.map(order => (
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
        </>
    );
}
