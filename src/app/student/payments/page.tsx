
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEnrollmentsByUserId, getOrdersByUserId, getCoursesByIds } from '@/lib/firebase/firestore';
import type { Enrollment, Order, Course } from '@/lib/types';
import { PaymentsClient } from './payments-client';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { safeToDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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

// This is now a client component to correctly handle auth state
export default function StudentPaymentsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [orders, setOrders] = useState<HydratedOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!userInfo) {
            toast({ title: 'Please log in to view your payments.', variant: 'destructive'});
            router.push('/login');
            return;
        }

        try {
            const [enrollmentsData, ordersData] = await Promise.all([
                getEnrollmentsByUserId(userInfo.uid),
                getOrdersByUserId(userInfo.uid)
            ]);
            
            let processedTransactions: Transaction[] = [];
            if (enrollmentsData.length > 0) {
                const courseIds = [...new Set(enrollmentsData.map(e => e.courseId))];
                const coursesData = await getCoursesByIds(courseIds);
                const coursesMap = new Map(coursesData.map(c => [c.id, c]));

                processedTransactions = enrollmentsData.map(e => {
                    const course = coursesMap.get(e.courseId);
                    return {
                        id: e.id!,
                        courseName: course?.title || 'Unknown Course',
                        date: safeToDate(e.enrollmentDate).toISOString(),
                        amount: e.totalFee || 0,
                        enrollment: e,
                    };
                }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
            setTransactions(processedTransactions);

            const serializedOrders: HydratedOrder[] = ordersData.map(order => ({
                ...order,
                createdAt: safeToDate(order.createdAt).toISOString(),
                updatedAt: safeToDate(order.updatedAt).toISOString(),
            }));
            setOrders(serializedOrders);
        } catch (error) {
            console.error("Failed to fetch payment data:", error);
            toast({ title: "Error", description: "Could not load payment history.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [userInfo, toast, router]);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Payment History</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    A record of all your transactions on the platform.
                </p>
            </div>
            <PaymentsClient initialTransactions={transactions} initialOrders={orders} />
        </div>
    );
}
