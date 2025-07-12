
'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getInstructorByUid } from "@/lib/firebase/firestore";
import type { Instructor } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { safeToDate } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const IdCardView = dynamic(() => import('@/components/id-card-view').then(mod => mod.IdCardView), {
  loading: () => <Skeleton className="h-[525px] w-full max-w-[330px] rounded-2xl" />,
  ssr: false,
});


export default function TeacherIdCardPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!userInfo) return;

        const fetchInstructor = async () => {
            try {
                const data = await getInstructorByUid(userInfo.uid);
                if (data) {
                    setInstructor(data);
                }
            } catch (error) {
                console.error(error);
                toast({ title: 'Error', description: 'Failed to load instructor data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        };
        fetchInstructor();
    }, [userInfo, toast]);

    const finalLoading = loading || authLoading;

    if (finalLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    if (!userInfo || !instructor) {
        return <p className="p-8 text-center">Could not load your information. Please log in again.</p>
    }

    const joinedDate = safeToDate(userInfo.joined);
    const formattedDate = !isNaN(joinedDate.getTime()) ? format(joinedDate, 'PPP') : 'N/A';

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tight">My ID Card</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Your official teacher identification card. You can download it as a PDF.
                </p>
            </div>
            <IdCardView 
                name={instructor.name}
                role={instructor.title || "Teacher"}
                idNumber={userInfo.registrationNumber || 'N/A'}
                joinedDate={formattedDate}
                email={userInfo.email}
                imageUrl={instructor.avatarUrl}
                dataAiHint={instructor.dataAiHint || "teacher person"}
            />
        </div>
    );
}
