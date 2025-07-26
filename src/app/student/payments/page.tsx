
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { PaymentsClient } from '@/components/student/payments/payments-client';
import { LoadingSpinner } from '@/components/loading-spinner';
import { getCoursesByIds, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Course } from '@/lib/types';
import { safeToDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function StudentPaymentsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!userInfo) {
            setLoading(false);
            return;
        }

        const fetchInitialData = async () => {
            try {
                const enrollmentsData = await getEnrollmentsByUserId(userInfo.uid);
                const courseIds = enrollmentsData.map(e => e.courseId);
                
                let coursesData: Course[] = [];
                if (courseIds.length > 0) {
                    coursesData = await getCoursesByIds(courseIds);
                }

                const transactionData = enrollmentsData.map(enrollment => {
                    const course = coursesData.find(c => c.id === enrollment.courseId);
                    return {
                        id: enrollment.id!,
                        courseName: course?.title || 'Unknown Course',
                        date: safeToDate(enrollment.enrollmentDate).toISOString(),
                        amount: enrollment.totalFee || parseFloat(course?.price?.replace(/[^0-9.]/g, '') || '0'),
                        enrollment: enrollment,
                    };
                }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setTransactions(transactionData);
            } catch (error) {
                console.error("Failed to fetch payment data:", error);
                toast({ title: 'Error', description: 'Could not load payment history.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [userInfo, authLoading, toast]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
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
            <PaymentsClient initialTransactions={transactions} />
        </div>
    );
}
