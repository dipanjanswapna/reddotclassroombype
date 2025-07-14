
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId, getPrebookingForUser } from '@/lib/firebase/firestore';
import { BookCheck, Loader2, BookmarkPlus, Bookmark, BookmarkCheck } from 'lucide-react';
import { prebookCourseAction } from '@/app/actions/enrollment.actions';
import { useToast } from './ui/use-toast';
import { useRouter } from 'next/navigation';
import type { ButtonProps } from './ui/button';
import type { Course } from '@/lib/types';

interface CourseEnrollmentButtonProps {
    courseId: string;
    isPrebookingActive: boolean;
    checkoutUrl: string;
    size?: ButtonProps['size'];
    courseType?: Course['type'];
}

export function CourseEnrollmentButton({ courseId, isPrebookingActive, checkoutUrl, size = "lg", courseType }: CourseEnrollmentButtonProps) {
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

    const handlePrebook = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        if (!userInfo) {
            router.push(`/login?redirect=/courses/${courseId}`);
            return;
        }
        const result = await prebookCourseAction({ courseId, userId: userInfo.uid });
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
            <Button size={size} className="w-full font-bold" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        );
    }
    
    // Logic for guests or non-student users
    if (!userInfo || userInfo.role !== 'Student') {
        if (isPrebookingActive) {
             return (
                <Button size={size} className="w-full font-bold bg-green-600 hover:bg-green-700" onClick={handlePrebook}>
                    <Bookmark className="mr-2 h-4 w-4" /> Pre-book Now
                </Button>
            );
        }
        return (
             <Button size={size} className="w-full font-bold bg-green-600 hover:bg-green-700" asChild>
                <Link href={checkoutUrl}>{courseType === 'Exam' ? 'Enroll in Exam Batch' : 'Enroll Now'}</Link>
            </Button>
        );
    }

    // Logged-in student logic
    if (isEnrolled) {
        return (
            <Button size={size} asChild className="w-full font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Link href={`/student/my-courses/${courseId}`}>
                    <BookCheck className="mr-2" />
                    {courseType === 'Exam' ? 'View Exams' : 'Go to Course'}
                </Link>
            </Button>
        );
    }

    if (isPrebookingActive) {
        if (isPrebooked) {
             return (
                <Button size={size} className="w-full font-bold" disabled>
                    <BookmarkCheck className="mr-2" />
                    Successfully Pre-booked
                </Button>
            );
        }
        return (
            <Button size={size} className="w-full font-bold bg-green-600 hover:bg-green-700" onClick={handlePrebook}>
                 <Bookmark className="mr-2 h-4 w-4" /> Pre-book Now
            </Button>
        );
    }

    return (
        <Button size={size} className="w-full font-bold bg-green-600 hover:bg-green-700" asChild>
            <Link href={checkoutUrl}>
                {courseType === 'Exam' ? 'Enroll in Exam Batch' : 'Enroll Now'}
            </Link>
        </Button>
    );
}
