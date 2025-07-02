
'use client';

import { IdCardView } from "@/components/id-card-view";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { getEnrollmentsByUserId, getCoursesByIds } from "@/lib/firebase/firestore";
import { Course } from "@/lib/types";
import { safeToDate } from "@/lib/utils";

export default function StudentIdCardPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && userInfo) {
            const fetchEnrolledCourses = async () => {
                try {
                    const enrollments = await getEnrollmentsByUserId(userInfo.uid);
                    const courseIds = enrollments.map(e => e.courseId);
                    if (courseIds.length > 0) {
                        const courses = await getCoursesByIds(courseIds);
                        setEnrolledCourses(courses);
                    }
                } catch (error) {
                    console.error("Failed to fetch enrolled courses for ID card:", error);
                } finally {
                    setDataLoading(false);
                }
            };
            fetchEnrolledCourses();
        } else if (!authLoading) {
            setDataLoading(false);
        }
    }, [userInfo, authLoading]);

    const loading = authLoading || dataLoading;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    if (!userInfo) {
        return <p className="p-8 text-center">Could not load your information. Please log in again.</p>
    }

    const joinedDate = safeToDate(userInfo.joined);
    const formattedDate = !isNaN(joinedDate.getTime()) ? format(joinedDate, 'PPP') : 'N/A';

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tight">My ID Card</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Your official student identification card. You can download it as a PDF.
                </p>
            </div>
            <IdCardView 
                name={userInfo.name}
                role={userInfo.role}
                idNumber={userInfo.registrationNumber || userInfo.uid}
                joinedDate={formattedDate}
                email={userInfo.email}
                imageUrl={userInfo.avatarUrl}
                dataAiHint="student person"
                classRoll={userInfo.classRoll}
                fathersName={userInfo.fathersName}
                mothersName={userInfo.mothersName}
                nidNumber={userInfo.nidNumber}
                mobileNumber={userInfo.mobileNumber}
                address={userInfo.address}
                enrolledCourses={enrolledCourses}
            />
        </div>
    );
}
