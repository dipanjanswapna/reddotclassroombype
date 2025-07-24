
'use client';

import { StudyPlannerClient } from '@/components/student/planner/study-planner-client';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { Suspense } from 'react';

function PlannerPageContent() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return <StudyPlannerClient />;
}


export default function StudentPlannerPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <PlannerPageContent />
        </Suspense>
    );
}
