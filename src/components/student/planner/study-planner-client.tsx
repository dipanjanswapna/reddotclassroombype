

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Course, Folder, List, PlannerTask, Goal } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, BrainCircuit, BarChart, Folder as FolderIcon, List as ListIcon, Edit, Trash2, X, Target, Calendar as CalendarIcon, ChevronsUpDown, Check, BookOpen, Settings, LayoutGrid, ListTodo } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateStudyPlan } from '@/ai/flows/study-plan-flow';
import { PomodoroTimer } from './pomodoro-timer';
import { generateExamPrepPlan } from '@/ai/flows/exam-prep-flow';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem } from '@/components/ui/command';
import { saveFolder, saveList, deleteTask, saveTask, deleteFolder, deleteList } from '@/app/actions/planner.actions';
import { getFoldersForUser, getListsForUser, getTasksForUser } from '@/lib/firebase/firestore';
import { DatePicker } from '@/components/ui/date-picker';
import { TaskItem } from './task-item';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { saveUserAction } from '@/app/actions/user.actions';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Column } from './column';
import { LoadingSpinner } from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import { CalendarView } from './calendar-view';
import { ProgressChart } from './progress-chart';
import { GoalManager } from './goal-manager';


interface StudyPlannerClientProps {
    courses: Course[];
    initialTasks: PlannerTask[];
    initialFolders: Folder[];
    initialLists: List[];
    initialGoals: Goal[];
}

const statusColumns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
] as const;


export function StudyPlannerClient({ courses, initialTasks, initialFolders, initialLists, initialGoals }: StudyPlannerClientProps) {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    
    const [tasks, setTasks] = useState<PlannerTask[]>(initialTasks);
    const [folders, setFolders] = useState<Folder[]>(initialFolders);
    const [lists, setLists] = useState<List[]>(initialLists);
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<PlannerTask> | null>(null);

    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [activeTask, setActiveTask] = useState<PlannerTask | null>(null);

    const [loading, setLoading] = useState(true);

    const [isAiPlanOpen, setIsAiPlanOpen] = useState(false);
    const [isAiExamPlanOpen, setIsAiExamPlanOpen] = useState(false);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
    const [pomodoroDurations, setPomodoroDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });

    // AI Form States
    const [aiPlanCourses, setAiPlanCourses] = useState<Course[]>([]);
    const [aiPlanStartDate, setAiPlanStartDate] = useState<Date | undefined>(new Date());
    const [aiPlanEndDate, setAiPlanEndDate] = useState<Date | undefined>(addDays(new Date(), 7));

    const [aiExamCourseContext, setAiExamCourseContext] = useState('');
    const [aiExamDate, setAiExamDate] = useState<Date | undefined>(new Date());

    const fetchAllData = useCallback(async () => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [
                userFolders,
                userLists,
                userTasks,
            ] = await Promise.all([
                getFoldersForUser(userInfo.uid),
                getListsForUser(userInfo.uid),
                getTasksForUser(userInfo.uid),
            ]);
            setFolders(userFolders);
            setLists(userLists);
            setTasks(userTasks);
        } catch(e) {
            console.error(e);
            toast({ title: 'Error loading planner data', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }, [userInfo, authLoading, toast]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);
    
    const filteredTasks = useMemo(() => {
        let tempTasks = tasks;
        if (selectedCourseId) {
            const course = courses.find(c => c.id === selectedCourseId);
            tempTasks = tasks.filter(e => e.courseTitle === course?.title);
        } else if (selectedListId) {
            tempTasks = tasks.filter(e => e.listId === selectedListId);
        } else if (selectedFolderId) {
            const listIdsInFolder = lists.filter(l => l.folderId === selectedFolderId).map(l => l.id!);
            tempTasks = tasks.filter(e => e.listId && listIdsInFolder.includes(e.listId));
        }
        return tempTasks;
    }, [tasks, lists, selectedFolderId, selectedListId, selectedCourseId, courses]);
    
    const openTaskDialog = (event: Partial<PlannerTask> | null, status?: PlannerTask['status']) => {
        const defaultListId = selectedListId || lists.find(l => l.folderId === selectedFolderId)?.id || lists[0]?.id;
        const defaultCourseTitle = selectedCourseId ? courses.find(c => c.id === selectedCourseId)?.title : undefined;

        setEditingEvent(event ? {...event} : { 
            date: format(new Date(), 'yyyy-MM-dd'), 
            type: 'study-session', 
            priority: 'low', 
            listId: defaultListId, 
            userId: userInfo?.uid, 
            status: status || 'todo',
            courseTitle: defaultCourseTitle
        });
        setIsTaskDialogOpen(true);
    };
    
    const handleSaveTask = async () => {
        if (!editingEvent?.title) {
            toast({ title: 'Title is required', variant: 'destructive'});
            return;
        }
        
        await saveTask(editingEvent as PlannerTask);
        await fetchAllData(); 
        setIsTaskDialogOpen(false);
        setEditingEvent(null);
    }
    
    const handleDeleteTask = async (eventId: string) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        await deleteTask(eventId, userInfo!.uid);
        setTasks(tasks.filter(e => e.id !== eventId));
    };
    
    const handleAddFolder = async () => {
        const newFolderName = prompt("Enter folder name:");
        if (newFolderName && userInfo) {
            const newFolder: Partial<Folder> = { name: newFolderName, userId: userInfo.uid, createdAt: new Date() as any, updatedAt: new Date() as any };
            await saveFolder(newFolder);
            fetchAllData();
        }
    };
    
    const handleAddList = async (folderId: string) => {
        const newListName = prompt("Enter list name:");
        if (newListName && userInfo) {
            const newList: Partial<List> = { name: newListName, userId: userInfo.uid, folderId, createdAt: new Date() as any, updatedAt: new Date() as any };
            await saveList(newList);
            fetchAllData();
        }
    };
    
    const handleDeleteFolder = async (folderId: string) => {
        if (!window.confirm("Are you sure you want to delete this folder and all its lists and tasks?")) return;
        await deleteFolder(folderId);
        fetchAllData();
    }
    
    const handleDeleteList = async (listId: string) => {
        if (!window.confirm("Are you sure you want to delete this list and all its tasks?")) return;
        await deleteList(listId);
        fetchAllData();
    }
    
    const handleTaskUpdate = (updatedTask: PlannerTask) => {
        setTasks(prev => prev.map(e => e.id === updatedTask.id ? updatedTask : e));
    }

    const handleGenerateAiPlan = async () => {
        if (!aiPlanStartDate || !aiPlanEndDate || aiPlanCourses.length === 0) {
            toast({ title: 'Please fill all fields', variant: 'destructive'});
            return;
        }
        setIsGeneratingPlan(true);
        try {
            const result = await generateStudyPlan({
                courses: aiPlanCourses.map(c => ({ id: c.id!, title: c.title, topics: c.syllabus?.map(s => s.title) || [] })),
                deadlines: [],
                startDate: format(aiPlanStartDate, 'yyyy-MM-dd'),
                endDate: format(aiPlanEndDate, 'yyyy-MM-dd'),
            });
            const newTasks = result.events.map(e => ({...e, userId: userInfo!.uid, status: 'todo' as const}));
            for (const task of newTasks) {
                await saveTask(task);
            }
            fetchAllData();
            toast({ title: 'Success', description: 'AI has generated and saved your study plan.'});
            setIsAiPlanOpen(false);
        } catch(e) {
             toast({ title: 'Error', description: 'Failed to generate study plan.', variant: 'destructive' });
        } finally {
            setIsGeneratingPlan(false);
        }
    };
    
     const handleGenerateExamPlan = async () => {
        if (!aiExamCourseContext || !aiExamDate) {
             toast({ title: 'Please fill all fields', variant: 'destructive'});
            return;
        }
        setIsGeneratingPlan(true);
        try {
            const result = await generateExamPrepPlan({
                courseContext: aiExamCourseContext,
                examDate: format(aiExamDate, 'yyyy-MM-dd'),
                currentDate: format(new Date(), 'yyyy-MM-dd'),
            });
            const newTasks = result.events.map(e => ({...e, userId: userInfo!.uid, status: 'todo' as const}));
            for (const task of newTasks) {
                await saveTask(task);
            }
            fetchAllData();
            toast({ title: 'Success', description: 'AI has generated and saved your exam prep plan.'});
            setIsAiExamPlanOpen(false);
        } catch(e) {
             toast({ title: 'Error', description: 'Failed to generate exam plan.', variant: 'destructive' });
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const clearFilters = () => {
        setSelectedFolderId(null);
        setSelectedListId(null);
        setSelectedCourseId(null);
    }
    
    const handleDragStart = (event: DragStartEvent) => {
        setActiveTask(tasks.find(t => t.id === event.active.id) || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;
    
        const activeId = active.id;
        const overId = over.id;
    
        if (activeId === overId) return;

        const overIsColumn = statusColumns.some(c => c.id === overId);

        setTasks((tasks) => {
            const activeIndex = tasks.findIndex((t) => t.id === activeId);
            const overIndex = tasks.findIndex((t) => t.id === overId);
            
            let newTasks;
            if (overIsColumn) {
                const taskToUpdate = tasks[activeIndex];
                if (taskToUpdate && taskToUpdate.status !== overId) {
                    newTasks = tasks.map((t, index) => 
                        index === activeIndex ? { ...t, status: overId as PlannerTask['status'] } : t
                    );
                    saveTask(newTasks[activeIndex]);
                } else {
                    return tasks;
                }
            } else {
                newTasks = arrayMove(tasks, activeIndex, overIndex);
            }
            return newTasks;
        });
    };
    
    const handlePomodoroSessionComplete = async (taskId: string, durationSeconds: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && userInfo) {
            const updatedTask: PlannerTask = {
                ...task,
                actualPomo: (task.actualPomo || 0) + 1,
                timeSpentSeconds: (task.timeSpentSeconds || 0) + durationSeconds,
            };
            
            const studyPoints = userInfo.studyPoints || 0;
            
            await Promise.all([
                saveTask(updatedTask),
                saveUserAction({ id: userInfo.id, studyPoints: studyPoints + 1 })
            ]);
            
            onTaskUpdate(updatedTask);
            await refreshUserInfo();
        }
    };

    const onTaskUpdate = (updatedTask: PlannerTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };
    
    // Analytics Data Processing
    const analyticsData = useMemo(() => {
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
        const last7Days = Array(7).fill(0).map((_, i) => subDays(new Date(), i)).reverse();

        const chartData = last7Days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const tasksOnDay = completedTasks.filter(t => format(new Date(t.completedAt!.toDate()), 'yyyy-MM-dd') === dateStr);
            return {
                name: format(date, 'EEE'),
                tasks: tasksOnDay.length,
                minutes: Math.round(tasksOnDay.reduce((sum, t) => sum + (t.timeSpentSeconds || 0), 0) / 60),
            };
        });

        const totalCompleted = completedTasks.length;
        const totalMinutes = completedTasks.reduce((sum, t) => sum + (t.timeSpentSeconds || 0), 0) / 60;
        
        let mostProductiveDay = 'N/A';
        if (chartData.length > 0) {
            const topDay = chartData.reduce((max, day) => day.minutes > max.minutes ? day : max, chartData[0]);
            if (topDay.minutes > 0) {
                mostProductiveDay = topDay.name;
            }
        }
        
        return { chartData, totalCompleted, totalMinutes: Math.round(totalMinutes), mostProductiveDay };
    }, [tasks]);


    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                 <aside className="lg:col-span-1 space-y-4 sticky top-24">
                     <Card>
                        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                        <CardContent>
                             <Button variant={!selectedFolderId && !selectedListId && !selectedCourseId ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={clearFilters}>All Tasks</Button>
                             <h4 className="font-semibold text-sm mt-4 mb-2">Courses</h4>
                             <div className="space-y-1">
                                {courses.map(course => (
                                    <Button key={course.id} variant={selectedCourseId === course.id ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => {setSelectedCourseId(course.id); setSelectedFolderId(null); setSelectedListId(null);}}>
                                        <BookOpen className="mr-2 h-4 w-4"/>
                                        {course.title}
                                    </Button>
                                ))}
                             </div>
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Folders & Lists</CardTitle>
                                <Button size="sm" variant="outline" onClick={handleAddFolder}><PlusCircle className="mr-2 h-4 w-4"/>Folder</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                            {folders.map(folder => (
                                <div key={folder.id}>
                                    <div 
                                        className={cn('flex items-center justify-between p-2 rounded-md cursor-pointer', selectedFolderId === folder.id && !selectedListId ? 'bg-accent' : '')}
                                        onClick={() => {setSelectedFolderId(folder.id); setSelectedListId(null); setSelectedCourseId(null);}}
                                    >
                                        <span className="flex items-center gap-2"><FolderIcon className="h-4 w-4"/> {folder.name}</span>
                                        <div className="flex items-center">
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleAddList(folder.id!);}}><PlusCircle className="h-3 w-3 text-muted-foreground"/></Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteFolder(folder.id!)}}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                        </div>
                                    </div>
                                    <div className="pl-6 space-y-1 mt-1">
                                        {lists.filter(l => l.folderId === folder.id).map(list => (
                                            <div key={list.id} className={cn('flex items-center justify-between p-1 rounded-md cursor-pointer text-sm', selectedListId === list.id ? 'bg-accent' : '')} onClick={() => {setSelectedFolderId(folder.id!); setSelectedListId(list.id!); setSelectedCourseId(null);}}>
                                                 <span className="flex items-center gap-2 text-muted-foreground"><ListIcon className="h-4 w-4"/> {list.name}</span>
                                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteList(list.id!)}}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            </div>
                        </CardContent>
                     </Card>
                      <Card>
                        <CardHeader>
                            <CardTitle>AI Assistant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <Button variant="outline" className="w-full" onClick={() => setIsAiPlanOpen(true)}>
                                <BrainCircuit className="mr-2 h-4 w-4"/> Generate Study Plan
                            </Button>
                             <Button variant="outline" className="w-full" onClick={() => setIsAiExamPlanOpen(true)}>
                                <BrainCircuit className="mr-2 h-4 w-4"/> Generate Exam Prep
                            </Button>
                        </CardContent>
                      </Card>
                       <PomodoroTimer tasks={tasks} onSessionComplete={handlePomodoroSessionComplete} durations={pomodoroDurations} onDurationsChange={setPomodoroDurations} />
                 </aside>
                <main className="lg:col-span-3">
                    {viewMode === 'board' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                             {statusColumns.map(column => (
                                <Column key={column.id} id={column.id} title={column.title}>
                                    {filteredTasks.filter(t => t.status === column.id).map(task => (
                                         <TaskItem 
                                            key={task.id} 
                                            task={task} 
                                            onEdit={() => openTaskDialog(task)}
                                            onDelete={() => handleDeleteTask(task.id!)}
                                            onUpdate={onTaskUpdate}
                                         />
                                    ))}
                                    <Button variant="outline" className="w-full mt-4 border-dashed" onClick={() => openTaskDialog(null, column.id)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                                    </Button>
                                </Column>
                            ))}
                        </div>
                    ) : viewMode === 'calendar' ? (
                        <CalendarView tasks={filteredTasks} onEditEvent={(task) => openTaskDialog(task)} />
                    ): null}
                </main>
            </div>
            {typeof document !== "undefined" && (
                <DragOverlay>
                    {activeTask ? (
                        <TaskItem task={activeTask} onEdit={() => {}} onDelete={() => {}} onUpdate={() => {}} />
                    ) : null}
                </DragOverlay>
            )}
        </DndContext>
    );
}
