
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Course, Folder, List, PlannerTask, Goal } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import { getFoldersForUser, getListsForUser, getTasksForUser, getGoalsForUser } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';

export function StudyPlannerClient() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [lists, setLists] = useState<List[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        if (!userInfo) return;
        setLoading(true);
        try {
            const [foldersData, listsData, tasksData, goalsData] = await Promise.all([
                getFoldersForUser(userInfo.uid),
                getListsForUser(userInfo.uid),
                getTasksForUser(userInfo.uid),
                getGoalsForUser(userInfo.uid),
            ]);
            setFolders(foldersData);
            setLists(listsData);
            setTasks(tasksData);
            setGoals(goalsData);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to load planner data.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }, [userInfo, toast]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }
    
    return (
        <div className="mt-8">
            <p>Study Planner foundation is set up. Next steps will build the UI.</p>
        </div>
    );
}
