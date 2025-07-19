
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId, getOrdersByUserId, getCourses } from '@/lib/firebase/firestore';
import type { Enrollment, Order, Course } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function StudentPaymentsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

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
                setEnrollments(enrollmentsData.sort((a,b) => safeToDate(b.enrollmentDate).getTime() - safeToDate(a.enrollmentDate).getTime()));
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
                                            <TableCell>{format(safeToDate(e.enrollmentDate), 'PPP')}</TableCell>
                                            <TableCell>৳{e.totalFee?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" disabled>
                                                    <Eye className="mr-2 h-4 w-4"/> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
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
        </div>
    );
}
