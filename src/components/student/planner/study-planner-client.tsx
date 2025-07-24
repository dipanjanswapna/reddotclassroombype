
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Course, Folder, List, PlannerTask, Goal } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import { getFoldersForUser, getListsForUser, getTasksForUser, getGoalsForUser } from '@/lib/firebase/firestore';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, DragStartEvent } from '@dnd-kit/core';
import { Column } from './column';
import { TaskItem } from './task-item';
import { TaskDialog } from './task-dialog';
import { FolderListSidebar } from './folder-list-sidebar';
import { saveTask } from '@/app/actions/planner.actions';
import { CalendarView } from './calendar-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsView } from './analytics-view';
import { GoalManager } from './goal-manager';
import { PomodoroTimer } from './pomodoro-timer';
import { WhiteNoisePlayer } from './white-noise-player';

const taskStatuses: PlannerTask['status'][] = ['todo', 'in_progress', 'completed'];
const statusTitles: Record<PlannerTask['status'], string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

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
    const [activeTask, setActiveTask] = useState<PlannerTask | null>(null);
    const [activeView, setActiveView] = useState('board');
    
    const [durations, setDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
    const [whiteNoise, setWhiteNoise] = useState('none');


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
                setDurations(userInfo.pomodoroSettings);
            }
             if (userInfo.plannerSettings) {
                setWhiteNoise(userInfo.plannerSettings.whiteNoise);
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

    const tasksByStatus = useMemo(() => {
        return taskStatuses.reduce((acc, status) => {
            acc[status] = tasks.filter(task => task.status === status);
            return acc;
        }, {} as Record<PlannerTask['status'], PlannerTask[]>);
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );
    
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) setActiveTask(task);
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (over && active.id !== over.id) {
            const activeTask = tasks.find(t => t.id === active.id);
            if (!activeTask) return;

            // Check if dropping into a column
            const newStatus = taskStatuses.find(s => s === over.id);
            if (newStatus && activeTask.status !== newStatus) {
                const updatedTask = { ...activeTask, status: newStatus };
                if (newStatus === 'completed') {
                    updatedTask.completedAt = new Date() as any;
                }
                
                // Optimistic UI update
                setTasks(prev => prev.map(t => (t.id === active.id ? updatedTask : t)));

                await saveTask(updatedTask);
            }
        }
    };
    
    const onTaskUpdate = (updatedTask: PlannerTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }
    
    const handleSessionComplete = async (taskId: string, durationSeconds: number) => {
        const task = tasks.find(t => t.id === taskId);
        if(!task) return;

        const updatedTask = {
            ...task,
            actualPomo: (task.actualPomo || 0) + 1,
            timeSpentSeconds: (task.timeSpentSeconds || 0) + durationSeconds,
        };
        onTaskUpdate(updatedTask);
        await saveTask(updatedTask);
    }
    
    const filteredEvents = useMemo(() => {
        // In the future, this can be filtered by the sidebar selection
        return tasks;
    }, [tasks]);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-8">
                <aside className="lg:col-span-1 space-y-4 sticky top-24">
                   <Button onClick={() => setIsTaskDialogOpen(true)} className="w-full"><PlusCircle className="mr-2 h-4 w-4"/> Add New Task</Button>
                   <FolderListSidebar
                        folders={folders}
                        lists={lists}
                        onFoldersChange={setFolders}
                        onListsChange={setLists}
                    />
                    <PomodoroTimer 
                        tasks={tasks}
                        onSessionComplete={handleSessionComplete}
                        durations={durations}
                        onDurationsChange={setDurations}
                    />
                    <WhiteNoisePlayer noiseType={whiteNoise} />
                </aside>
                <main className="lg:col-span-3">
                    <Tabs defaultValue="board" value={activeView} onValueChange={setActiveView} className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="board">Board</TabsTrigger>
                        <TabsTrigger value="calendar">Calendar</TabsTrigger>
                        <TabsTrigger value="goals">Goals</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      </TabsList>
                      <TabsContent value="board" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            {taskStatuses.map((status) => (
                                <Column key={status} id={status} title={statusTitles[status]}>
                                    {(tasksByStatus[status] || []).map(task => (
                                        <TaskItem 
                                            key={task.id} 
                                            task={task} 
                                            onEdit={() => { setEditingTask(task); setIsTaskDialogOpen(true); }}
                                            onDelete={() => {}}
                                            onUpdate={onTaskUpdate}
                                        />
                                    ))}
                                </Column>
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="calendar" className="mt-6">
                          <CalendarView tasks={filteredEvents} onEditEvent={(task) => { setEditingTask(task); setIsTaskDialogOpen(true); }} />
                      </TabsContent>
                       <TabsContent value="goals" className="mt-6">
                          <GoalManager initialGoals={goals} onGoalsChange={setGoals} />
                      </TabsContent>
                      <TabsContent value="analytics" className="mt-6">
                          <AnalyticsView tasks={tasks} />
                      </TabsContent>
                    </Tabs>
                </main>
            </div>
             <TaskDialog
                isOpen={isTaskDialogOpen}
                setIsOpen={setIsTaskDialogOpen}
                editingTask={editingTask}
                onTaskSaved={(savedTask) => {
                    if (editingTask?.id) {
                        setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
                    } else {
                        setTasks(prev => [savedTask, ...prev]);
                    }
                    setEditingTask(null);
                }}
                lists={lists}
            />
            <DragOverlay>
                {activeTask ? <TaskItem task={activeTask} onEdit={()=>{}} onDelete={()=>{}} onUpdate={()=>{}} /> : null}
            </DragOverlay>
        </DndContext>
    );
}

