
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
import { saveTask, deleteTask } from '@/app/actions/planner.actions';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  Active,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { saveUserAction } from '@/app/actions/user.actions';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function StudyPlannerClient() {
    const { toast } = useToast();
    const { userInfo, refreshUserInfo } = useAuth();
    
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [lists, setLists] = useState<List[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<PlannerTask> | null>(null);

    const [activeTask, setActiveTask] = useState<PlannerTask | null>(null);
    const [activeListId, setActiveListId] = useState<string>('all');
    
    const [pomodoroDurations, setPomodoroDurations] = useState({
        work: 25,
        shortBreak: 5,
        longBreak: 15
    });

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
             if (userInfo.pomodoroSettings) {
                setPomodoroDurations(userInfo.pomodoroSettings);
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to load planner data.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }, [userInfo, toast]);

    useEffect(() => {
        if (!userInfo?.uid) {
            setLoading(false);
            return;
        }
        fetchAllData();
    }, [userInfo?.uid, fetchAllData]);

    const handleTaskSaved = () => {
        fetchAllData(); 
    }
    
    const handleEditTask = (task: PlannerTask) => {
        setEditingTask(task);
        setIsTaskDialogOpen(true);
    };

    const handleAddTask = (status: PlannerTask['status']) => {
        setEditingTask({ status, listId: activeListId === 'all' ? undefined : activeListId });
        setIsTaskDialogOpen(true);
    };
    
     const handleDeleteTask = async (taskId: string) => {
        if (!userInfo) return;
        const originalTasks = tasks;
        setTasks(prev => prev.filter(t => t.id !== taskId));
        try {
          await deleteTask(taskId, userInfo.uid);
        } catch (error) {
          toast({ title: "Error", description: "Failed to delete task.", variant: "destructive"});
          setTasks(originalTasks);
        }
    };
    
    const handleUpdateTask = (updatedTask: PlannerTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const filteredTasks = useMemo(() => {
        if (activeListId === 'all') return tasks;
        return tasks.filter(t => t.listId === activeListId);
    }, [tasks, activeListId]);

    const columns = useMemo(() => {
        return {
            todo: filteredTasks.filter(t => t.status === 'todo'),
            in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
            completed: filteredTasks.filter(t => t.status === 'completed'),
        };
    }, [filteredTasks]);
    
     const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );
    
    const onDragStart = (event: { active: Active }) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task || null);
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (over && active.id !== over.id) {
            const activeTask = tasks.find(task => task.id === active.id);
            if (activeTask && typeof over.id === 'string' && ['todo', 'in_progress', 'completed'].includes(over.id)) {
                const newStatus = over.id as PlannerTask['status'];
                const updatedTask = { ...activeTask, status: newStatus };
                
                // Optimistic update
                setTasks(prevTasks => prevTasks.map(task => task.id === active.id ? updatedTask : task));

                // Save to DB
                await saveTask(updatedTask);
            }
        }
    };
    
    const handleSessionComplete = async (taskId: string, durationSeconds: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const updatedTask = {
                ...task,
                actualPomo: (task.actualPomo || 0) + 1,
                timeSpentSeconds: (task.timeSpentSeconds || 0) + durationSeconds,
            };
            await saveTask(updatedTask);
            setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
            toast({ title: 'Session Complete!', description: `A Pomodoro session for "${task.title}" has been logged.` });
        }
    };
    
    const handlePomodoroDurationsChange = async (newDurations: typeof pomodoroDurations) => {
        setPomodoroDurations(newDurations);
        if (userInfo?.id) {
            await saveUserAction({ id: userInfo.id, pomodoroSettings: newDurations });
            refreshUserInfo();
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }
    
    return (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="mt-8">
                <Tabs defaultValue="board" className="w-full">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                        <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                            <TabsList className="flex w-full md:w-auto h-auto p-1 bg-muted/50 rounded-xl shadow-inner">
                                <TabsTrigger value="board" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-tighter text-[10px] data-[state=active]:shadow-md">Board</TabsTrigger>
                                <TabsTrigger value="calendar" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-tighter text-[10px] data-[state=active]:shadow-md">Calendar</TabsTrigger>
                                <TabsTrigger value="analytics" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-tighter text-[10px] data-[state=active]:shadow-md">Analytics</TabsTrigger>
                                <TabsTrigger value="goals" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-tighter text-[10px] data-[state=active]:shadow-md">Goals</TabsTrigger>
                                <TabsTrigger value="settings" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-tighter text-[10px] data-[state=active]:shadow-md">Settings</TabsTrigger>
                            </TabsList>
                        </div>
                        <Button onClick={() => handleAddTask('todo')} className="w-full md:w-auto font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            <PlusCircle className="mr-2 h-4 w-4"/> 
                            Add New Task
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-1 space-y-8">
                            <FolderListSidebar 
                                folders={folders} 
                                lists={lists} 
                                onFoldersChange={setFolders}
                                onListsChange={setLists}
                                onSelectList={setActiveListId}
                                activeListId={activeListId}
                            />
                            <PomodoroTimer 
                                tasks={tasks}
                                onSessionComplete={handleSessionComplete}
                                durations={pomodoroDurations}
                                onDurationsChange={handlePomodoroDurationsChange}
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <AnimatePresence mode="wait">
                                <TabsContent value="board" className="mt-0 outline-none">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                    >
                                        <Column id="todo" title="To Do" onAddTask={() => handleAddTask('todo')}>
                                            <SortableContext items={columns.todo.map(t => t.id!)} strategy={verticalListSortingStrategy}>
                                                {columns.todo.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                            </SortableContext>
                                        </Column>
                                        <Column id="in_progress" title="In Progress" onAddTask={() => handleAddTask('in_progress')}>
                                            <SortableContext items={columns.in_progress.map(t => t.id!)} strategy={verticalListSortingStrategy}>
                                                 {columns.in_progress.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                            </SortableContext>
                                        </Column>
                                        <Column id="completed" title="Completed" onAddTask={() => handleAddTask('completed')}>
                                            <SortableContext items={columns.completed.map(t => t.id!)} strategy={verticalListSortingStrategy}>
                                                 {columns.completed.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                            </SortableContext>
                                        </Column>
                                    </motion.div>
                                </TabsContent>
                                <TabsContent value="calendar" className="mt-0 outline-none">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <CalendarView tasks={tasks} onEditEvent={handleEditTask} />
                                    </motion.div>
                                </TabsContent>
                                <TabsContent value="analytics" className="mt-0 outline-none">
                                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                                        <AnalyticsView tasks={tasks} />
                                    </motion.div>
                                </TabsContent>
                                <TabsContent value="goals" className="mt-0 outline-none">
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <GoalManager initialGoals={goals} onGoalsChange={setGoals} />
                                    </motion.div>
                                </TabsContent>
                                <TabsContent value="settings" className="mt-0 outline-none">
                                     <Card className="rounded-2xl border-white/20 shadow-xl bg-card">
                                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                            <div className="bg-primary/10 p-4 rounded-2xl mb-4">
                                                <PlusCircle className="w-8 h-8 text-primary" />
                                            </div>
                                            <h3 className="font-headline text-xl font-black uppercase tracking-tight mb-2">Planner Customization</h3>
                                            <p className="text-muted-foreground font-medium mb-6 max-w-sm">Change your theme, focus sounds, and Google Calendar sync settings.</p>
                                            <Button asChild className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 h-11 shadow-lg shadow-primary/20">
                                                <Link href="/student/planner/settings">Open Full Settings</Link>
                                            </Button>
                                        </CardContent>
                                     </Card>
                                </TabsContent>
                            </AnimatePresence>
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
             <DragOverlay>
                {activeTask ? <TaskItem task={activeTask} onEdit={() => {}} onDelete={()=>{}} onUpdate={()=>{}} /> : null}
            </DragOverlay>
             <WhiteNoisePlayer noiseType={userInfo?.plannerSettings?.whiteNoise || 'none'} />
        </DndContext>
    );
}
