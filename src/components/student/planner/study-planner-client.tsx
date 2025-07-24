
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
        fetchAllData();
    }, [fetchAllData]);

    const handleTaskSaved = (savedTask: PlannerTask) => {
        if (savedTask.id && tasks.some(t => t.id === savedTask.id)) {
            setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
        } else {
            fetchAllData(); // Refetch to get new item with real ID
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
    
     const handleDeleteTask = async (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };
    
    const handleUpdateTask = (updatedTask: PlannerTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const columns = useMemo(() => {
        return {
            todo: tasks.filter(t => t.status === 'todo'),
            in_progress: tasks.filter(t => t.status === 'in_progress'),
            completed: tasks.filter(t => t.status === 'completed'),
        };
    }, [tasks]);
    
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
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="board">Board</TabsTrigger>
                            <TabsTrigger value="calendar">Calendar</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="goals">Goals</TabsTrigger>
                        </TabsList>
                        <Button onClick={handleAddTask}><PlusCircle className="mr-2 h-4 w-4"/> Add Task</Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        <div className="lg:col-span-1 space-y-6">
                            <FolderListSidebar 
                                folders={folders} 
                                lists={lists} 
                                onFoldersChange={setFolders}
                                onListsChange={setLists}
                            />
                            <PomodoroTimer 
                                tasks={tasks}
                                onSessionComplete={handleSessionComplete}
                                durations={pomodoroDurations}
                                onDurationsChange={handlePomodoroDurationsChange}
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <TabsContent value="board">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Column id="todo" title="To Do" onAddTask={handleAddTask}>
                                        <SortableContext items={columns.todo.map(t => t.id!)} strategy={verticalListSortingStrategy}>
                                            {columns.todo.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                        </SortableContext>
                                    </Column>
                                    <Column id="in_progress" title="In Progress" onAddTask={handleAddTask}>
                                        <SortableContext items={columns.in_progress.map(t => t.id!)} strategy={verticalListSortingStrategy}>
                                             {columns.in_progress.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                        </SortableContext>
                                    </Column>
                                    <Column id="completed" title="Completed" onAddTask={handleAddTask}>
                                        <SortableContext items={columns.completed.map(t => t.id!)} strategy={verticalListSortingStrategy}>
                                             {columns.completed.map(task => <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id!)} onUpdate={handleUpdateTask}/>)}
                                        </SortableContext>
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
             <DragOverlay>
                {activeTask ? <TaskItem task={activeTask} onEdit={() => {}} onDelete={()=>{}} onUpdate={()=>{}} /> : null}
            </DragOverlay>
             <WhiteNoisePlayer noiseType={userInfo?.plannerSettings?.whiteNoise || 'none'} />
        </DndContext>
    );
}
