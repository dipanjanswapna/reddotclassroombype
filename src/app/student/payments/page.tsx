
import { getCoursesByIds, getEnrollmentsByUserId } from "@/lib/firebase/firestore";
import type { Course, Enrollment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { PaymentsClient } from './payments-client';
import { getCurrentUser } from "@/lib/firebase/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { safeToDate } from "@/lib/utils";

// Make the page itself a Server Component to fetch initial data
async function PaymentsPageContent() {
    const user = await getCurrentUser();

    if (!user) {
        // This is a server component, so redirect is appropriate
        redirect('/login?redirect=/student/payments');
    }

    const enrollmentsData = await getEnrollmentsByUserId(user.uid);
    const courseIds = enrollmentsData.map(e => e.courseId);
    
    let coursesData: Course[] = [];
    if (courseIds.length > 0) {
        coursesData = await getCoursesByIds(courseIds);
    }
    
    const transactions = enrollmentsData.map(enrollment => {
        const course = coursesData.find(c => c.id === enrollment.courseId);
        return {
            id: enrollment.id!,
            courseName: course?.title || 'Unknown Course',
            date: safeToDate(enrollment.enrollmentDate).toISOString(),
            amount: enrollment.totalFee || parseFloat(course?.price.replace(/[^0-9.]/g, '') || '0'),
            enrollment: enrollment,
        };
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // We no longer need to fetch orders here as it's handled in the client

    return <PaymentsClient initialTransactions={transactions} />;
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
             <Suspense fallback={
                <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
                    <LoadingSpinner className="w-12 h-12" />
                </div>
             }>
                <PaymentsPageContent />
             </Suspense>
        </div>
    );
}
