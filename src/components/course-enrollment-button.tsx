'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { BookCheck, Loader2 } from 'lucide-react';

interface CourseEnrollmentButtonProps {
    courseId: string;
    isPrebookingActive: boolean;
    prebookUrl: string;
    checkoutUrl: string;
}

export function CourseEnrollmentButton({ courseId, isPrebookingActive, prebookUrl, checkoutUrl }: CourseEnrollmentButtonProps) {
    const { userInfo, loading: authLoading } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loadingEnrollment, setLoadingEnrollment] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        
        if (!userInfo || userInfo.role !== 'Student') {
            setLoadingEnrollment(false);
            return;
        }

        const checkEnrollment = async () => {
            try {
                const enrollments = await getEnrollmentsByUserId(userInfo.uid);
                const enrolled = enrollments.some(e => e.courseId === courseId);
                setIsEnrolled(enrolled);
            } catch (error) {
                console.error("Failed to check enrollment status:", error);
            } finally {
                setLoadingEnrollment(false);
            }
        };

        checkEnrollment();
    }, [userInfo, authLoading, courseId]);

    if (authLoading || loadingEnrollment) {
        return (
            <Button size="lg" className="w-full font-bold" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        );
    }
    
    if (isEnrolled) {
        return (
            <Button size="lg" asChild className="w-full font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Link href={`/student/my-courses/${courseId}`}>
                    <BookCheck className="mr-2" />
                    Go to Course
                </Link>
            </Button>
        );
    }

    return (
        <Button size="lg" className="w-full font-bold bg-green-600 hover:bg-green-700" asChild>
            <Link href={isPrebookingActive ? prebookUrl : checkoutUrl}>
                {isPrebookingActive ? 'Pre-book Now' : 'Enroll Now'}
            </Link>
        </Button>
    );
}
