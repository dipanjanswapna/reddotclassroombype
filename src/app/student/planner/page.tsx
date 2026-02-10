'use client';

import { Suspense } from 'react';
import { StudyPlannerClient } from '@/components/student/planner/study-planner-client';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * @fileOverview Study Planner Page with Edge-to-Edge Layout.
 * Final wall-to-wall optimization with px-2 side padding for mobile.
 */
function PlannerPageContent() {
    return (
        <div className="px-2 md:px-4 py-4 md:py-8 space-y-8 md:space-y-12">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1 border-l-4 border-primary pl-4"
            >
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-primary/20">
                    <Sparkles className="w-3 h-3" />
                    Productivity Suite
                </div>
                <h1 className="font-headline text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
                    Study <span className="text-primary">Planner</span>
                </h1>
                <p className="text-muted-foreground font-medium text-xs md:text-sm">
                    Organize your schedule, track your tasks, and stay productive.
                </p>
            </motion.div>
            <StudyPlannerClient />
        </div>
    );
}

export default function StudentPlannerPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner className="w-12 h-12" /></div>}>
            <PlannerPageContent />
        </Suspense>
    );
}