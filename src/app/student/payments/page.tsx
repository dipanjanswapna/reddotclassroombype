

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId, getOrdersByUserId, getCourses, getInvoiceByEnrollmentId, getDocument, getCourse } from '@/lib/firebase/firestore';
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

export default function StudentPaymentsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                const [enrollmentsData, ordersData, coursesData] = await Promise.all([
                    getEnrollmentsByUserId(userInfo.uid),
                    getOrdersByUserId(userInfo.uid),
                    getCourses()
                ]);

                const processedEnrollments = enrollmentsData.map(e => ({
                    ...e,
                    enrollmentDate: safeToDate(e.enrollmentDate) // Ensure it's a Date object
                })).sort((a,b) => b.enrollmentDate.getTime() - a.enrollmentDate.getTime());
                
                setEnrollments(processedEnrollments);
                setOrders(ordersData);
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching payment data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [userInfo, authLoading]);
    
    const handleViewInvoice = async (enrollment: Enrollment) => {
        if (!userInfo || !enrollment.id) return;

        setIsInvoiceOpen(true);
        setLoadingInvoice(true);
        setSelectedInvoice(null);
        
        try {
            let invoice = await getInvoiceByEnrollmentId(enrollment.id);

            if (!invoice) {
                const course = courses.find(c => c.id === enrollment.courseId);
                if (course) {
                    toast({ title: 'Invoice not found', description: 'Generating a new one for you...' });
                    const result = await createInvoiceAction(enrollment, userInfo, course);
                    if (result.success && result.invoiceId) {
                        invoice = await getDocument<Invoice>('invoices', result.invoiceId);
                    } else {
                        throw new Error(result.message || "Failed to create invoice.");
                    }
                } else {
                    throw new Error("Could not find course details to generate invoice.");
                }
            }

            if (invoice) {
                if (!invoice.courseDetails.communityUrl) {
                    const course = await getCourse(invoice.courseId);
                    if(course) {
                        const isCycleEnrollment = !!invoice.courseDetails.cycleName;
                        const cycle = isCycleEnrollment ? course.cycles?.find(c => c.title === invoice.courseDetails.cycleName) : null;
                        const communityUrl = isCycleEnrollment ? cycle?.communityUrl : course.communityUrl;
                        if (communityUrl) {
                            invoice.courseDetails.communityUrl = communityUrl;
                        }
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
                                {enrollments.map(e => {
                                    const course = courses.find(c => c.id === e.courseId);
                                    return (
                                        <TableRow key={e.id}>
                                            <TableCell>{course?.title || 'Unknown Course'}</TableCell>
                                            <TableCell>{format(e.enrollmentDate, 'PPP')}</TableCell>
                                            <TableCell>৳{e.totalFee?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" onClick={() => handleViewInvoice(e)}>
                                                    <Eye className="mr-2 h-4 w-4"/> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                 {enrollments.length === 0 && (
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
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono">#{order.id?.slice(0,8)}</TableCell>
                                        <TableCell>{format(safeToDate(order.createdAt), 'PPP')}</TableCell>
                                        <TableCell>৳{order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell><Badge>{order.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
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
