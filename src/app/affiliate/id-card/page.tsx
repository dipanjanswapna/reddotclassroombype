
'use client';

import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { format } from "date-fns";
import { safeToDate } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const IdCardView = dynamic(() => import('@/components/id-card-view').then(mod => mod.IdCardView), {
  loading: () => <Skeleton className="h-[525px] w-full max-w-[330px] rounded-2xl" />,
  ssr: false,
});


export default function AffiliateIdCardPage() {
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

    const joinedDate = safeToDate(userInfo.joined);
    const formattedDate = !isNaN(joinedDate.getTime()) ? format(joinedDate, 'PPP') : 'N/A';

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tight">My ID Card</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Your official affiliate identification card. You can download it as a PDF.
                </p>
            </div>
            <IdCardView 
                name={userInfo.name}
                role={userInfo.role}
                idNumber={userInfo.registrationNumber || 'N/A'}
                joinedDate={formattedDate}
                email={userInfo.email}
                imageUrl={userInfo.avatarUrl}
                dataAiHint="person professional"
            />
        </div>
    );
}
