

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Course, Folder, List, PlannerTask, Goal } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import { getFoldersForUser, getListsForUser, getTasksForUser, getGoalsForUser } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderListSidebar } from './folder-list-sidebar';
import { Column } from './column';
import { TaskItem } from './task-item';
import { TaskDialog } from './task-dialog';
import { AnalyticsView } from './analytics-view';
import { CalendarView } from './calendar-view';
import { GoalManager } from './goal-manager';
import { PomodoroTimer } from './pomodoro-timer';
import { WhiteNoisePlayer } from './white-noise-player';
import { saveTask } from '@/app/actions/planner.actions';

export function StudyPlannerClient() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [lists, setLists] = useState<List[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<PlannerTask> | null>(null);

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

    const handleTaskSaved = (savedTask: PlannerTask) => {
        // This is an optimistic update. A better approach would refetch or use the returned ID.
        if (savedTask.id && tasks.some(t => t.id === savedTask.id)) {
            setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
        } else {
            setTasks(prev => [...prev, { ...savedTask, id: `new_${Date.now()}` }]);
        }
    }
    
    const handleEditTask = (task: PlannerTask) => {
        setEditingTask(task);
        setIsTaskDialogOpen(true);
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setIsTaskDialogOpen(true);
    };

    const columns = useMemo(() => {
        return {
            todo: tasks.filter(t => t.status === 'todo'),
            in_progress: tasks.filter(t => t.status === 'in_progress'),
            completed: tasks.filter(t => t.status === 'completed'),
        };
    }, [tasks]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }
    
    return (
        <div className="mt-8">
            <Tabs defaultValue="board" className="w-full">
                <div className="flex justify-between items-center mb-4">
                     <TabsList>
                        <TabsTrigger value="board">Board</TabsTrigger>
                        <TabsTrigger value="calendar">Calendar</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="goals">Goals</TabsTrigger>
                    </TabsList>
                    <Button onClick={handleAddTask}><PlusCircle className="mr-2 h-4 w-4"/> Add Task</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    <div className="md:col-span-1">
                        <FolderListSidebar 
                            folders={folders} 
                            lists={lists} 
                            onFoldersChange={setFolders}
                            onListsChange={setLists}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <TabsContent value="board">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Column id="todo" title="To Do">
                                    {columns.todo.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={()=>{}} onUpdate={()=>{}}/>)}
                                </Column>
                                <Column id="in_progress" title="In Progress">
                                     {columns.in_progress.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={()=>{}} onUpdate={()=>{}}/>)}
                                </Column>
                                <Column id="completed" title="Completed">
                                     {columns.completed.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={()=>{}} onUpdate={()=>{}}/>)}
                                </Column>
                            </div>
                        </TabsContent>
                        <TabsContent value="calendar">
                           <CalendarView tasks={tasks} onEditEvent={handleEditTask} />
                        </TabsContent>
                         <TabsContent value="analytics">
                           <AnalyticsView tasks={tasks} />
                        </TabsContent>
                         <TabsContent value="goals">
                           <GoalManager initialGoals={goals} onGoalsChange={setGoals} />
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
            <TaskDialog 
                isOpen={isTaskDialogOpen}
                setIsOpen={setIsTaskDialogOpen}
                editingTask={editingTask}
                onTaskSaved={handleTaskSaved}
                lists={lists}
            />
        </div>
    );
}
