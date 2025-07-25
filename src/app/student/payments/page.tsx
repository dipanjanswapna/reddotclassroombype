
import { getEnrollmentsByUserId, getCoursesByIds, getOrdersByUserId } from '@/lib/firebase/firestore';
import { getCurrentUser } from '@/lib/firebase/auth';
import type { Enrollment, Order, Course } from '@/lib/types';
import { PaymentsClient } from './payments-client';
import { redirect } from 'next/navigation';
import { safeToDate } from '@/lib/utils';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

type Transaction = {
  id: string;
  courseName: string;
  date: string; // Serialized date
  amount: number;
  enrollment: Enrollment;
};

type HydratedOrder = Omit<Order, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
}

async function PaymentsPageContent() {
    const user = await getCurrentUser();

    if (!user) {
        // This should be caught by middleware in a real app, but as a fallback:
        redirect('/login');
    }

    const [enrollmentsData, ordersData] = await Promise.all([
        getEnrollmentsByUserId(user.uid),
        getOrdersByUserId(user.uid)
    ]);
    
    let transactions: Transaction[] = [];
    if (enrollmentsData.length > 0) {
        const courseIds = [...new Set(enrollmentsData.map(e => e.courseId))];
        const coursesData = await getCoursesByIds(courseIds);
        const coursesMap = new Map(coursesData.map(c => [c.id, c]));

        transactions = enrollmentsData.map(e => {
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

    const serializedOrders: HydratedOrder[] = ordersData.map(order => ({
        ...order,
        createdAt: safeToDate(order.createdAt).toISOString(),
        updatedAt: safeToDate(order.updatedAt).toISOString(),
    }));

    return <PaymentsClient initialTransactions={transactions} initialOrders={serializedOrders} />;
}


export default function StudentPaymentsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Payment History</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    A record of all your transactions on the platform.
                </p>
            </div>
             <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner/></div>}>
                <PaymentsPageContent />
             </Suspense>
        </div>
    );
}
