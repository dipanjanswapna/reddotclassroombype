

'use client';

import { StudyPlannerClient } from '@/components/student/planner/study-planner-client';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { Suspense, useEffect, useState } from 'react';
import { getCourses, getEnrollmentsByUserId, getFoldersForUser, getListsForUser, getTasksForUser, getGoalsForUser } from '@/lib/firebase/firestore';
import { Course, Folder, List, PlannerTask, Goal } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';
import PlannerSettingsPage from './settings/page';
import { GoalManager } from '@/components/student/planner/goal-manager';


function PlannerPageContent() {
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const initialView = searchParams.get('view') || 'planner';

    const [folders, setFolders] = useState<Folder[]>([]);
    const [lists, setLists] = useState<List[]>([]);
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeView, setActiveView] = useState(initialView);


     useEffect(() => {
        if (authLoading) return;
        if (!userInfo) {
            setLoadingData(false);
            return;
        }

        const fetchAllData = async () => {
            try {
                const [
                    userFolders,
                    userLists,
                    userTasks,
                    userGoals,
                    enrollments,
                ] = await Promise.all([
                    getFoldersForUser(userInfo.uid),
                    getListsForUser(userInfo.uid),
                    getTasksForUser(userInfo.uid),
                    getGoalsForUser(userInfo.uid),
                    getEnrollmentsByUserId(userInfo.uid)
                ]);

                setFolders(userFolders);
                setLists(userLists);
                setTasks(userTasks);
                setGoals(userGoals);

                const courseIds = enrollments.map(e => e.courseId);
                if (courseIds.length > 0) {
                    const fetchedCourses = await getCourses({ ids: courseIds });
                    setCourses(fetchedCourses);
                }

            } catch (error) {
                console.error("Failed to load planner data:", error);
                toast({ title: 'Error', description: 'Could not load planner data.', variant: 'destructive'});
            } finally {
                setLoadingData(false);
            }
        };

        fetchAllData();
    }, [userInfo, authLoading, toast]);


    if (loadingData || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Study Planner</h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        Organize your schedule, track your tasks, and stay productive.
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant={activeView === 'planner' ? 'default' : 'outline'} onClick={() => setActiveView('planner')}>Planner</Button>
                    <Button variant={activeView === 'analytics' ? 'default' : 'outline'} onClick={() => setActiveView('analytics')}>Analytics</Button>
                    <Button variant={activeView === 'goals' ? 'default' : 'outline'} onClick={() => setActiveView('goals')}>Goals</Button>
                    <Button variant={activeView === 'settings' ? 'default' : 'outline'} onClick={() => setActiveView('settings')}>Settings</Button>
                </div>
            </div>

            {activeView === 'planner' && (
                <StudyPlannerClient 
                    initialTasks={tasks} 
                    initialFolders={folders}
                    initialLists={lists}
                    initialGoals={goals}
                    courses={courses}
                />
            )}
             {activeView === 'goals' && <GoalManager initialGoals={goals} onGoalsChange={setGoals} />}
             {activeView === 'settings' && <PlannerSettingsPage />}
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

