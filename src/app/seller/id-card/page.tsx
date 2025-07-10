
'use client';

import { useState, useEffect } from "react";
import { IdCardView } from "@/components/id-card-view";
import { useAuth } from "@/context/auth-context";
import { getOrganizationByUserId } from "@/lib/firebase/firestore";
import type { Organization } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { safeToDate } from "@/lib/utils";

export default function SellerIdCardPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!userInfo) return;

        const fetchOrganization = async () => {
            try {
                const data = await getOrganizationByUserId(userInfo.uid);
                if (data) {
                    setOrganization(data);
                }
            } catch (error) {
                console.error(error);
                toast({ title: 'Error', description: 'Failed to load organization data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        };
        fetchOrganization();
    }, [userInfo, toast]);

    const finalLoading = loading || authLoading;

    if (finalLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    if (!userInfo || !organization) {
        return <p className="p-8 text-center">Could not load your information. Please log in again.</p>
    }

    const joinedDate = safeToDate(userInfo.joined);
    const formattedDate = !isNaN(joinedDate.getTime()) ? format(joinedDate, 'PPP') : 'N/A';

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Organization ID Card</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Your official seller organization identification card.
                </p>
            </div>
            <IdCardView 
                name={organization.name}
                role="Seller Organization"
                idNumber={userInfo.registrationNumber || 'N/A'}
                joinedDate={formattedDate}
                email={userInfo.email}
                imageUrl={organization.logoUrl}
                organization={organization.name}
                dataAiHint="organization logo"
            />
        </div>
    );
}
