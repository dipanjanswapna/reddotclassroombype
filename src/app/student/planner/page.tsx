
'use client';

import { StudyPlannerClient } from '@/components/student/planner/study-planner-client';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { Suspense, useEffect, useState } from 'react';
import { getCourses, getEnrollmentsByUserId, getFoldersForUser, getListsForUser, getTasksForUser, getUser } from '@/lib/firebase/firestore';
import { Course, Folder, List, PlannerTask, User } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';


function PlannerPageContent() {
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const { toast } = useToast();

    const [folders, setFolders] = useState<Folder[]>([]);
    const [lists, setLists] = useState<List[]>([]);
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingData, setLoadingData] = useState(true);

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
                    enrollments,
                ] = await Promise.all([
                    getFoldersForUser(userInfo.uid),
                    getListsForUser(userInfo.uid),
                    getTasksForUser(userInfo.uid),
                    getEnrollmentsByUserId(userInfo.uid)
                ]);

                setFolders(userFolders);
                setLists(userLists);
                setTasks(userTasks);

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
    
    return <StudyPlannerClient 
        initialTasks={tasks} 
        initialFolders={folders}
        initialLists={lists}
        courses={courses}
    />;
}


export default function StudentPlannerPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <PlannerPageContent />
        </Suspense>
    );
}
