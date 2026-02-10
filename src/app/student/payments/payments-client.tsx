'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getCourse, getDocument, getOrdersByUserId, getInvoiceByEnrollmentId } from '@/lib/firebase/firestore';
import type { Enrollment, Order, Invoice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, FileText, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvoiceView } from '@/components/invoice-view';
import { createInvoiceAction, updateInvoiceAction } from '@/app/actions/invoice.actions';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion, AnimatePresence } from 'framer-motion';

type Transaction = {
  id: string;
  courseName: string;
  date: string;
  amount: number;
  enrollment: Enrollment;
};

type HydratedOrder = Omit<Order, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
}

interface PaymentsClientProps {
    initialTransactions: Transaction[];
}

export function PaymentsClient({ initialTransactions }: TransactionProps) {
    const { userInfo } = useAuth();
    const { toast } = useToast();
    
    const [orders, setOrders] = useState<HydratedOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);

    useEffect(() => {
        if (userInfo) {
            getOrdersByUserId(userInfo.uid)
                .then(ordersData => {
                    const serializedOrders: HydratedOrder[] = ordersData.map(order => ({
                        ...order,
                        createdAt: safeToDate(order.createdAt).toISOString(),
                        updatedAt: safeToDate(order.updatedAt).toISOString(),
                    }));
                    setOrders(serializedOrders);
                })
                .catch(err => {
                    console.error("Failed to load store orders", err);
                    toast({ title: "Error", description: "Could not load store order history.", variant: "destructive" });
                })
                .finally(() => setLoadingOrders(false));
        } else {
             setLoadingOrders(false);
        }
    }, [userInfo, toast]);


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
        <div className="w-full">
            <Tabs defaultValue="courses" className="w-full">
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar mb-8">
                    <TabsList className="flex w-full md:w-auto h-auto p-1 bg-muted/50 rounded-xl shadow-inner">
                        <TabsTrigger value="courses" className="rounded-lg px-8 py-2.5 font-bold uppercase tracking-tighter text-[10px] data-[state=active]:shadow-md flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5" />
                            Course Enrollments
                        </TabsTrigger>
                        <TabsTrigger value="store" className="rounded-lg px-8 py-2.5 font-bold uppercase tracking-tighter text-[10px] data-[state=active]:shadow-md flex items-center gap-2">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Store Orders
                        </TabsTrigger>
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="courses" className="mt-0 outline-none">
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="rounded-3xl border-white/40 shadow-xl bg-card overflow-hidden">
                                <CardHeader className="bg-primary/5 p-6 border-b border-black/5">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Course Billing</CardTitle>
                                    <CardDescription className="font-medium text-xs">আপনার এনরোল করা কোর্সের পেমেন্ট হিস্ট্রি এবং ইনভয়েস।</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="border-black/5">
                                                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Course Name</TableHead>
                                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Purchase Date</TableHead>
                                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Amount Paid</TableHead>
                                                    <TableHead className="font-black uppercase tracking-widest text-[10px] text-right px-6">Invoice</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {initialTransactions.length > 0 ? initialTransactions.map(t => (
                                                    <TableRow key={t.id} className="border-black/5 hover:bg-muted/20 transition-colors">
                                                        <TableCell className="px-6 py-4">
                                                            <div className="font-bold text-sm uppercase tracking-tight">{t.courseName}</div>
                                                            <div className="text-[9px] font-black uppercase text-muted-foreground mt-0.5">Enrollment ID: #{t.id.slice(-8)}</div>
                                                        </TableCell>
                                                        <TableCell className="text-[10px] font-bold text-muted-foreground py-4">
                                                            {format(safeToDate(t.date), 'PPP')}
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <span className="font-black text-foreground">৳{t.amount.toFixed(0)}</span>
                                                        </TableCell>
                                                        <TableCell className="text-right px-6 py-4">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="rounded-xl font-black text-[9px] uppercase tracking-widest h-8 px-4 hover:bg-primary hover:text-white transition-all border-black/5"
                                                                onClick={() => handleViewInvoice(t.enrollment)}
                                                            >
                                                                <FileText className="mr-1.5 h-3 w-3" />
                                                                View Invoice
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-40 text-center">
                                                            <div className="flex flex-col items-center justify-center opacity-30">
                                                                <CreditCard className="w-12 h-12 mb-2" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest">No course enrollments found</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="store" className="mt-0 outline-none">
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="rounded-3xl border-white/40 shadow-xl bg-card overflow-hidden">
                                <CardHeader className="bg-primary/5 p-6 border-b border-black/5">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">RDC Store Orders</CardTitle>
                                    <CardDescription className="font-medium text-xs">বুকস, স্টেশনারী এবং অন্যান্য পণ্যের অর্ডার হিস্ট্রি।</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {loadingOrders ? (
                                        <div className="flex justify-center h-40 items-center"><LoadingSpinner className="w-8 h-8"/></div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow className="border-black/5">
                                                        <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Order ID</TableHead>
                                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Order Date</TableHead>
                                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Amount</TableHead>
                                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right px-6">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {orders.length > 0 ? orders.map(order => (
                                                        <TableRow key={order.id} className="border-black/5 hover:bg-muted/20 transition-colors">
                                                            <TableCell className="px-6 py-4">
                                                                <div className="font-bold text-sm uppercase tracking-tight font-mono">#{order.id?.slice(0,8)}</div>
                                                                <div className="text-[9px] font-black uppercase text-muted-foreground mt-0.5">{order.items.length} Items Purchased</div>
                                                            </TableCell>
                                                            <TableCell className="text-[10px] font-bold text-muted-foreground py-4">
                                                                {format(safeToDate(order.createdAt), 'PPP')}
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <span className="font-black text-foreground">৳{order.totalAmount.toFixed(0)}</span>
                                                            </TableCell>
                                                            <TableCell className="text-right px-6 py-4">
                                                                <Badge className={cn(
                                                                    "text-[9px] font-black uppercase tracking-widest",
                                                                    order.status === 'Delivered' ? 'bg-accent' : 'bg-muted text-muted-foreground'
                                                                )}>
                                                                    {order.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    )) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="h-40 text-center">
                                                                <div className="flex flex-col items-center justify-center opacity-30">
                                                                    <ShoppingBag className="w-12 h-12 mb-2" />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest">No store orders found</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                   <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                        {loadingInvoice ? (
                            <div className="flex flex-col items-center justify-center h-96 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Generating Digital Invoice...</p>
                            </div>
                        ) : selectedInvoice ? (
                            <InvoiceView invoice={selectedInvoice} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-96 gap-4 p-8 text-center">
                                <AlertTriangle className="h-12 w-12 text-destructive" />
                                <div>
                                    <h3 className="font-black uppercase tracking-tight text-lg">Invoicing Error</h3>
                                    <p className="text-sm text-muted-foreground mt-1">এই কোর্সের জন্য ইনভয়েস লোড করা সম্ভব হয়নি। দয়া করে সাপোর্ট টিমে যোগাযোগ করুন।</p>
                                </div>
                                <Button onClick={() => setIsInvoiceOpen(false)} variant="outline" className="rounded-xl font-bold">বন্ধ করুন</Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
