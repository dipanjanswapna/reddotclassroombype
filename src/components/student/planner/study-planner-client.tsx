'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Folder, List, PlannerTask, Goal } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, SlidersHorizontal, Volume2, Calendar as CalendarIcon, Save, Loader2, Sparkles, LayoutDashboard, BarChart3, Target, CalendarDays, Settings2, Trash2 } from 'lucide-react';
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
} from '@dnd-kit/core';
import { saveUserAction } from '@/app/actions/user.actions';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const themes = [
    { name: 'Default', value: 'default', color: 'bg-primary' },
    { name: 'Forest', value: 'forest', color: 'bg-green-600' },
    { name: 'Ocean', value: 'ocean', color: 'bg-blue-600' },
    { name: 'Sunset', value: 'sunset', color: 'bg-orange-600' },
    { name: 'Rose', value: 'rose', color: 'bg-rose-600' },
];

const whiteNoises = [
    { name: 'No focus sound', value: 'none' },
    { name: 'Rainfall', value: 'rain' },
    { name: 'Zen Forest', value: 'forest' },
    { name: 'Study Cafe', value: 'cafe' },
];

/**
 * @fileOverview Study Planner Client Component.
 * Optimized for high-density wall-to-wall responsive UI with 20px corners and px-2 mobile padding.
 */
export function StudyPlannerClient() {
    const { toast } = useToast();
    const { userInfo, refreshUserInfo } = useAuth();
    const router = useRouter();
    
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

    const [selectedTheme, setSelectedTheme] = useState(userInfo?.plannerSettings?.theme || 'default');
    const [selectedNoise, setSelectedNoise] = useState(userInfo?.plannerSettings?.whiteNoise || 'none');
    const [isSavingSettings, setIsSavingSettings] = useState(false);

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
            if (userInfo.plannerSettings) {
                setSelectedTheme(userInfo.plannerSettings.theme || 'default');
                setSelectedNoise(userInfo.plannerSettings.whiteNoise || 'none');
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
    
    const onDragStart = (event: any) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task || null);
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (over && active.id !== over.id) {
            const activeTaskItem = tasks.find(task => task.id === active.id);
            if (activeTaskItem && typeof over.id === 'string' && ['todo', 'in_progress', 'completed'].includes(over.id)) {
                const newStatus = over.id as PlannerTask['status'];
                const updatedTask = { ...activeTaskItem, status: newStatus };
                
                setTasks(prevTasks => prevTasks.map(task => task.id === active.id ? updatedTask : task));
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

    const handleSaveSettings = async () => {
        if (!userInfo?.id) return;
        setIsSavingSettings(true);
        try {
            await saveUserAction({
                id: userInfo.id,
                plannerSettings: {
                    theme: selectedTheme,
                    whiteNoise: selectedNoise
                }
            });
            await refreshUserInfo();
            toast({ title: 'Success', description: 'Planner preferences updated.'});
        } catch(error) {
            toast({ title: 'Error', description: 'Could not save settings.', variant: 'destructive'});
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleGoogleCalendarSync = () => {
        if (!userInfo?.id) {
            toast({ title: 'Please log in first', variant: 'destructive'});
            return;
        }
        const authUrl = `/api/google-calendar/auth?userId=${userInfo.id}`;
        router.push(authUrl);
    };

    const tabTriggers = [
        { value: 'board', label: 'Board', icon: LayoutDashboard },
        { value: 'calendar', label: 'Calendar', icon: CalendarDays },
        { value: 'analytics', label: 'Analytics', icon: BarChart3 },
        { value: 'goals', label: 'Goals', icon: Target },
        { value: 'settings', label: 'Settings', icon: Settings2 },
    ];

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }
    
    return (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
            <div className="w-full">
                <Tabs defaultValue="board" className="w-full">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 px-1">
                        <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                            <TabsList className="flex w-full md:w-auto h-12 p-1 bg-muted/30 dark:bg-card/20 rounded-[20px] shadow-inner border border-white/10 gap-1">
                                {tabTriggers.map((tab) => (
                                    <TabsTrigger 
                                        key={tab.value}
                                        value={tab.value} 
                                        className={cn(
                                            "rounded-[16px] px-5 sm:px-8 py-2 font-black uppercase tracking-wider text-[10px] md:text-xs transition-all duration-300 flex items-center gap-2 h-full border-none outline-none",
                                            "data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-[0_4px_15px_rgba(0,0,0,0.1)] data-[state=active]:scale-100",
                                            "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        <span>{tab.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <Button onClick={() => handleAddTask('todo')} className="w-full md:w-auto font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-[20px] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                            <PlusCircle className="mr-2 h-4 w-4"/> 
                            Add New Task
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        <div className="lg:col-span-3 space-y-4">
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
                        <div className="lg:col-span-9">
                            <AnimatePresence mode="wait">
                                <TabsContent value="board" className="mt-0 outline-none">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                    >
                                        <Column id="todo" title="To Do" onAddTask={() => handleAddTask('todo')}>
                                            <div className="space-y-3">
                                                {columns.todo.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                            </div>
                                        </Column>
                                        <Column id="in_progress" title="In Progress" onAddTask={() => handleAddTask('in_progress')}>
                                            <div className="space-y-3">
                                                 {columns.in_progress.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                            </div>
                                        </Column>
                                        <Column id="completed" title="Completed" onAddTask={() => handleAddTask('completed')}>
                                            <div className="space-y-3">
                                                 {columns.completed.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                            </div>
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
                                     <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                                        <Card className="rounded-[25px] border-primary/20 shadow-xl overflow-hidden bg-card">
                                            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                                <CardTitle className="text-xl font-black uppercase tracking-tight">Appearance & Focus</CardTitle>
                                                <CardDescription className="font-medium text-xs">Personalize your productivity hub workspace.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-8 space-y-10">
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Workspace Theme</Label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                                        {themes.map(theme => (
                                                            <button 
                                                                key={theme.value} 
                                                                onClick={() => setSelectedTheme(theme.value)} 
                                                                className={cn(
                                                                    "p-3 rounded-[20px] border-2 transition-all group relative overflow-hidden",
                                                                    selectedTheme === theme.value ? 'border-primary bg-primary/5 shadow-md' : 'border-primary/5 bg-muted/20 hover:border-primary/20'
                                                                )}
                                                            >
                                                            <div className={cn("h-16 w-full rounded-xl shadow-inner mb-3", theme.color)}></div>
                                                            <p className="text-[10px] font-black uppercase tracking-tight text-foreground">{theme.name}</p>
                                                            {selectedTheme === theme.value && <Sparkles className="absolute top-2 right-2 w-3 h-3 text-primary" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-primary/10 pt-10">
                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Focus Background Sound</Label>
                                                        <div className="relative">
                                                            <Volume2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                                                            <Select value={selectedNoise} onValueChange={setSelectedNoise}>
                                                                <SelectTrigger className="h-12 rounded-xl pl-10 font-bold border-primary/5 bg-background shadow-sm">
                                                                    <SelectValue placeholder="Pick a focus sound..." />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-white/10">
                                                                    {whiteNoises.map(noise => (
                                                                        <SelectItem key={noise.value} value={noise.value} className="font-bold text-xs uppercase">{noise.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Played automatically during work sessions.</p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Calendar Integration</Label>
                                                        <Card className="rounded-[20px] bg-muted/30 border-dashed border-2 border-primary/10 p-5">
                                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                                <div className="text-center sm:text-left">
                                                                    <h4 className="font-black text-xs uppercase tracking-tight text-foreground">Google Calendar</h4>
                                                                    <p className="text-[10px] font-medium text-muted-foreground mt-1">Sync your study sessions.</p>
                                                                </div>
                                                                <Button onClick={handleGoogleCalendarSync} variant="outline" className="rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest border-primary/20 hover:bg-primary hover:text-white transition-all">
                                                                    <CalendarIcon className="mr-2 h-3.5 w-3.5"/>
                                                                    Connect
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="bg-primary/5 p-6 border-t border-primary/10 flex justify-end">
                                                <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="font-black uppercase tracking-widest px-10 h-12 rounded-xl shadow-xl shadow-primary/20">
                                                    {isSavingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                                                    Save Changes
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                     </motion.div>
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
