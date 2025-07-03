
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId, getPrebookingForUser } from '@/lib/firebase/firestore';
import { BookCheck, Loader2, BookmarkPlus } from 'lucide-react';
import { prebookCourseAction } from '@/app/actions/enrollment.actions';
import { useToast } from './ui/use-toast';
import { useRouter } from 'next/navigation';

interface CourseEnrollmentButtonProps {
    courseId: string;
    isPrebookingActive: boolean;
    checkoutUrl: string;
}

export function CourseEnrollmentButton({ courseId, isPrebookingActive, checkoutUrl }: CourseEnrollmentButtonProps) {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isPrebooked, setIsPrebooked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        
        if (!userInfo || userInfo.role !== 'Student') {
            setLoading(false);
            return;
        }

        const checkStatus = async () => {
            try {
                const [enrollments, prebooking] = await Promise.all([
                    getEnrollmentsByUserId(userInfo.uid),
                    getPrebookingForUser(courseId, userInfo.uid)
                ]);
                const enrolled = enrollments.some(e => e.courseId === courseId);
                setIsEnrolled(enrolled);
                setIsPrebooked(!!prebooking);
            } catch (error) {
                console.error("Failed to check enrollment/pre-booking status:", error);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [userInfo, authLoading, courseId]);

    const handlePrebook = async () => {
        setLoading(true);
        if (!userInfo) {
            router.push('/login');
            return;
        }
        const result = await prebookCourseAction(courseId, userInfo.uid);
        if (result.success) {
            toast({
                title: "Pre-booking Successful!",
                description: result.message,
            });
            setIsPrebooked(true);
        } else {
            toast({
                title: "Pre-booking Failed",
                description: result.message,
                variant: 'destructive',
            });
        }
        setLoading(false);
    };

    if (authLoading || loading) {
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

    if (isPrebookingActive) {
        if (isPrebooked) {
             return (
                <Button size="lg" className="w-full font-bold" disabled>
                    <BookmarkPlus className="mr-2" />
                    Successfully Pre-booked
                </Button>
            );
        }
        return (
            <Button size="lg" className="w-full font-bold bg-green-600 hover:bg-green-700" onClick={handlePrebook}>
                Pre-book Now
            </Button>
        );
    }

    return (
        <Button size="lg" className="w-full font-bold bg-green-600 hover:bg-green-700" asChild>
            <Link href={checkoutUrl}>
                Enroll Now
            </Link>
        </Button>
    );
}
