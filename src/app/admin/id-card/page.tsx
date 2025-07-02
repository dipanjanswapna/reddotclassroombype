
'use client';

import { IdCardView } from "@/components/id-card-view";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

const formatJoinedDate = (joined: any): string => {
    if (!joined) return 'N/A';
    if (typeof joined.toDate === 'function') {
        return format(joined.toDate(), 'PPP');
    }
    if (typeof joined.seconds === 'number') {
        return format(new Timestamp(joined.seconds, joined.nanoseconds || 0).toDate(), 'PPP');
    }
    if (typeof joined === 'string') {
        const date = new Date(joined);
        if (!isNaN(date.getTime())) {
            return format(date, 'PPP');
        }
    }
    if (joined instanceof Date) {
        return format(joined, 'PPP');
    }
    return 'Date not available';
};


export default function AdminIdCardPage() {
    const { userInfo, loading } = useAuth();

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

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tight">My ID Card</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Your official administrator identification card. You can download it as a PDF.
                </p>
            </div>
            <IdCardView 
                name={userInfo.name}
                role={userInfo.role}
                idNumber={userInfo.uid}
                joinedDate={formatJoinedDate(userInfo.joined)}
                email={userInfo.email}
                imageUrl={userInfo.avatarUrl}
                dataAiHint="professional person"
            />
        </div>
    );
}
