
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { StudyPlannerClient } from '@/components/student/planner/study-planner-client';
import { LoadingSpinner } from '@/components/loading-spinner';

function PlannerPageContent() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Study Planner</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Organize your schedule, track your tasks, and stay productive.
            </p>
            <StudyPlannerClient />
        </div>
    );
}

export default function StudentPlannerPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner /></div>}>
            <PlannerPageContent />
        </Suspense>
    );
}
