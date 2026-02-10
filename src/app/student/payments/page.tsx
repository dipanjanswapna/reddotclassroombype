'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { PaymentsClient } from './payments-client';
import { LoadingSpinner } from '@/components/loading-spinner';
import { getCoursesByIds, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Course } from '@/lib/types';
import { safeToDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Wallet, Sparkles } from 'lucide-react';

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
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="space-y-10 md:space-y-14 pb-10">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 border-l-4 border-primary pl-6"
            >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                    <Wallet className="w-3 h-3" />
                    Billing & Transactions
                </div>
                <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                    Payments <span className="text-primary">& Invoices</span>
                </h1>
                <p className="text-muted-foreground font-medium text-base md:text-lg max-w-2xl">
                    আপনার সকল পেমেন্ট ট্রানজ্যাকশন এবং ডিজিটাল ইনভয়েস এখানে খুঁজে পাবেন।
                </p>
            </motion.div>
            
            <PaymentsClient initialTransactions={transactions} />
        </div>
    );
}
