'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Course, Folder, List, PlannerTask, CheckItem, Goal } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, BrainCircuit, BarChart, Settings, Folder as FolderIcon, List as ListIcon, Edit, Trash2, X, Target, Calendar as CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';
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
import { ProgressChart } from './progress-chart';
import { generateExamPrepPlan } from '@/ai/flows/exam-prep-flow';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem } from '@/components/ui/command';
import { saveFolder, saveList, deleteTask, saveTask, deleteFolder, deleteList, saveGoal, deleteGoal } from '@/app/actions/planner.actions';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/loading-spinner';
import { DatePicker } from '@/components/ui/date-picker';
import { TaskItem } from './task-item';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { saveUserAction } from '@/app/actions/user.actions';
import { GoalManager } from './goal-manager';
import { CalendarView } from './calendar-view';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea as TextareaAI } from '@/components/ui/textarea';
import { DayView } from './day-view';
import { WeekView } from './week-view';

interface StudyPlannerClientProps {
    initialTasks: PlannerTask[];
    initialFolders: Folder[];
    initialLists: List[];
    initialGoals: Goal[];
    courses: Course[];
}


export function StudyPlannerClient({ initialTasks, initialFolders, initialLists, initialGoals, courses }: StudyPlannerClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    
    const [events, setEvents] = useState<PlannerTask[]>(initialTasks);
    const [folders, setFolders] = useState<Folder[]>(initialFolders);
    const [lists, setLists] = useState<List[]>(initialLists);
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<PlannerTask> | null>(null);

    const [activeView, setActiveView] = useState('planner');
    const [calendarView, setCalendarView] = useState('month'); // month, week, day
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    const [durations, setDurations] = useState(userInfo?.pomodoroSettings || { work: 25, shortBreak: 5, longBreak: 15 });
    const [loading, setLoading] = useState(true);

    const [isAiPlanOpen, setIsAiPlanOpen] = useState(false);
    const [isAiExamPlanOpen, setIsAiExamPlanOpen] = useState(false);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    // AI Form States
    const [aiPlanCourses, setAiPlanCourses] = useState<Course[]>([]);
    const [aiPlanStartDate, setAiPlanStartDate] = useState<Date | undefined>(new Date());
    const [aiPlanEndDate, setAiPlanEndDate] = useState<Date | undefined>(addDays(new Date(), 7));

    const [aiExamCourseContext, setAiExamCourseContext] = useState('');
    const [aiExamDate, setAiExamDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        if (!authLoading) {
            setLoading(false);
        }
    }, [authLoading]);
    
    const filteredEvents = useMemo(() => {
        if (!selectedListId) {
             if (!selectedFolderId) {
                return events; // Show all events if no folder/list is selected
            }
            const listIdsInFolder = lists.filter(l => l.folderId === selectedFolderId).map(l => l.id!);
            return events.filter(e => e.listId && listIdsInFolder.includes(e.listId));
        }
        return events.filter(e => e.listId === selectedListId);
    }, [events, lists, selectedFolderId, selectedListId]);
    
    const openTaskDialog = (event: Partial<PlannerTask> | null) => {
        const defaultListId = selectedListId || lists.find(l => l.folderId === selectedFolderId)?.id || lists[0]?.id;
        const selectedDate = event?.date ? new Date(event.date) : currentDate;
        setEditingEvent(event ? {...event} : { date: format(selectedDate, 'yyyy-MM-dd'), type: 'study-session', priority: 'low', listId: defaultListId, userId: userInfo?.uid, status: 'todo' });
        setIsTaskDialogOpen(true);
    };
    
    const handleSaveTask = async () => {
        if (!editingEvent?.title) {
            toast({ title: 'Title is required', variant: 'destructive'});
            return;
        }
        
        await saveTask(editingEvent as PlannerTask);
        
        const newEvents = editingEvent.id
            ? events.map(e => e.id === editingEvent!.id ? editingEvent as PlannerTask : e)
            : [...events, { ...editingEvent, id: `manual_${Date.now()}` } as PlannerTask];
            
        setEvents(newEvents);
        
        setIsTaskDialogOpen(false);
        setEditingEvent(null);
    }
    
    const handleDeleteTask = async (eventId: string) => {
        await deleteTask(eventId, userInfo!.uid);
        setEvents(events.filter(e => e.id !== eventId));
    };
    
    const handleAddFolder = async () => {
        const newFolderName = prompt("Enter folder name:");
        if (newFolderName && userInfo) {
            const newFolder: Partial<Folder> = { name: newFolderName, userId: userInfo.uid, createdAt: new Date() as any, updatedAt: new Date() as any };
            await saveFolder(newFolder);
            setFolders(prev => [...prev, newFolder as Folder]);
        }
    };
    
    const handleAddList = async (folderId: string) => {
        const newListName = prompt("Enter list name:");
        if (newListName && userInfo) {
            const newList: Partial<List> = { name: newListName, userId: userInfo.uid, folderId, createdAt: new Date() as any, updatedAt: new Date() as any };
            await saveList(newList);
            setLists(prev => [...prev, newList as List]);
        }
    };
    
    const handleDeleteFolder = async (folderId: string) => {
        if (!window.confirm("Are you sure you want to delete this folder and all its lists and tasks?")) return;
        await deleteFolder(folderId);
        setFolders(folders.filter(f => f.id !== folderId));
        const listsToDelete = lists.filter(l => l.folderId === folderId).map(l => l.id!);
        setLists(lists.filter(l => l.folderId !== folderId));
        setEvents(events.filter(e => e.listId && !listsToDelete.includes(e.listId)));
    }
    
    const handleDeleteList = async (listId: string) => {
        if (!window.confirm("Are you sure you want to delete this list and all its tasks?")) return;
        await deleteList(listId);
        setLists(lists.filter(l => l.id !== listId));
        setEvents(events.filter(e => e.listId !== listId));
    }
    
    const handlePomoSessionComplete = async (taskId: string) => {
        const task = events.find(e => e.id === taskId);
        if (task && userInfo) {
            const newActualPomo = (task.actualPomo || 0) + 1;
            const updatedTask = { ...task, actualPomo: newActualPomo };
            await saveTask(updatedTask);
            setEvents(prev => prev.map(e => e.id === taskId ? updatedTask : e));
            await saveUserAction({ id: userInfo.uid, studyPoints: (userInfo.studyPoints || 0) + 1 });
            await refreshUserInfo();
            toast({ title: "Session Complete!", description: "You've earned 1 study point." });
        }
    };
    
    const handleGoogleCalendarSync = () => {
        if (!userInfo) return;
        const authUrl = `/api/google-calendar/auth?userId=${userInfo.id}`;
        router.push(authUrl);
    };

    const handleTaskUpdate = (updatedTask: PlannerTask) => {
        setEvents(prev => prev.map(e => e.id === updatedTask.id ? updatedTask : e));
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
            setEvents(prev => [...prev, ...newTasks as PlannerTask[]]);
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
            });
            const newTasks = result.events.map(e => ({...e, userId: userInfo!.uid, status: 'todo' as const}));
            for (const task of newTasks) {
                await saveTask(task);
            }
            setEvents(prev => [...prev, ...newTasks as PlannerTask[]]);
            toast({ title: 'Success', description: 'AI has generated and saved your exam prep plan.'});
            setIsAiExamPlanOpen(false);
        } catch(e) {
             toast({ title: 'Error', description: 'Failed to generate exam plan.', variant: 'destructive' });
        } finally {
            setIsGeneratingPlan(false);
        }
    };
    
    // Analytics calculation
    const completedTasksCount = useMemo(() => events.filter(e => e.status === 'completed').length, [events]);
    const totalPomoSessions = useMemo(() => events.reduce((acc, e) => acc + (e.actualPomo || 0), 0), [events]);
    const totalTimeSpentMinutes = useMemo(() => {
        return events.reduce((acc, e) => acc + (e.timeSpentSeconds || 0), 0) / 60;
    }, [events]);

    const dailyProgress = useMemo(() => {
        const data: { [key: string]: number } = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = addDays(today, -i);
            const dateStr = format(date, 'MMM d');
            data[dateStr] = 0;
        }
        events.forEach(event => {
            if (!event.date) return;
            const eventDate = new Date(event.date);
            const diff = today.getTime() - eventDate.getTime();
            if (diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000) {
                 const dateStr = format(eventDate, 'MMM d');
                 data[dateStr] += (event.timeSpentSeconds || 0) / 60;
            }
        });
        return Object.entries(data).map(([name, minutes]) => ({ name, minutes: Math.round(minutes) }));
    }, [events]);

    const eventsForDayView = useMemo(() => {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        return filteredEvents.filter(e => e.date === dateStr);
    }, [currentDate, filteredEvents]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>
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
                    <Button variant={activeView === 'settings' ? 'default' : 'outline'} onClick={() => setActiveView('settings')}><Settings className="h-4 w-4"/></Button>
                </div>
            </div>
            
            {activeView === 'planner' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                 <aside className="lg:col-span-1 space-y-4">
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
                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedFolderId === folder.id && !selectedListId ? 'bg-accent' : ''}`}
                                        onClick={() => {setSelectedFolderId(folder.id); setSelectedListId(null);}}
                                    >
                                        <span className="flex items-center gap-2"><FolderIcon className="h-4 w-4"/> {folder.name}</span>
                                        <div className="flex items-center">
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleAddList(folder.id!);}}><PlusCircle className="h-3 w-3 text-muted-foreground"/></Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteFolder(folder.id!)}}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                        </div>
                                    </div>
                                    <div className="pl-6 space-y-1 mt-1">
                                        {lists.filter(l => l.folderId === folder.id).map(list => (
                                            <div key={list.id} className={`flex items-center justify-between p-1 rounded-md cursor-pointer text-sm ${selectedListId === list.id ? 'bg-accent' : ''}`} onClick={() => {setSelectedFolderId(folder.id!); setSelectedListId(list.id!);}}>
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
                     <PomodoroTimer tasksForToday={[]} onSessionComplete={handlePomoSessionComplete} durations={durations} setDurations={setDurations}/>
                 </aside>
                <main className="lg:col-span-3">
                   <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
                                    <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => addDays(prev, calendarView === 'month' ? -30 : calendarView === 'week' ? -7 : -1))}>&lt;</Button>
                                    <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => addDays(prev, calendarView === 'month' ? 30 : calendarView === 'week' ? 7 : 1))}>&gt;</Button>
                                    <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button size="sm" variant={calendarView === 'month' ? 'default' : 'outline'} onClick={() => setCalendarView('month')}>Month</Button>
                                     <Button size="sm" variant={calendarView === 'week' ? 'default' : 'outline'} onClick={() => setCalendarView('week')}>Week</Button>
                                     <Button size="sm" variant={calendarView === 'day' ? 'default' : 'outline'} onClick={() => setCalendarView('day')}>Day</Button>
                                     <Button size="sm" variant="accent" onClick={() => openTaskDialog(null)}><PlusCircle className="mr-2 h-4 w-4"/> Add Task</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {calendarView === 'month' && <CalendarView events={filteredEvents} onEditEvent={openTaskDialog}/>}
                            {calendarView === 'week' && <WeekView currentDate={currentDate} events={filteredEvents} selectedDate={currentDate} onSelectDate={setCurrentDate} />}
                            {calendarView === 'day' && <DayView selectedDate={currentDate} events={eventsForDayView} onEdit={openTaskDialog} onDelete={handleDeleteTask} onTaskUpdate={handleTaskUpdate}/>}
                        </CardContent>
                    </Card>
                </main>
            </div>
            )}
            
             {activeView === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Tasks Completed</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{completedTasksCount}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Total Pomodoro Sessions</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{totalPomoSessions}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Total Study Time</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{totalTimeSpentMinutes.toFixed(0)} <span className="text-lg">minutes</span></p></CardContent>
                    </Card>
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Study Progress - Last 7 Days (Minutes)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProgressChart data={dailyProgress} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeView === 'goals' && (
                <GoalManager initialGoals={goals} onGoalsChange={setGoals} />
            )}
            
            {activeView === 'settings' && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Planner Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="p-4 border rounded-md space-y-4">
                             <div className="flex items-center justify-between">
                                 <div>
                                     <Label className="font-semibold">Google Calendar Sync</Label>
                                     <p className="text-xs text-muted-foreground">Sync your study plan with your Google Calendar.</p>
                                 </div>
                                 <Button onClick={handleGoogleCalendarSync}><CalendarIcon className="mr-2 h-4 w-4"/>Sync Now</Button>
                             </div>
                         </div>
                    </CardContent>
                </Card>
            )}

             <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEvent?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                         <div className="space-y-2">
                            <Label>List</Label>
                            <Select value={editingEvent?.listId} onValueChange={(v) => setEditingEvent(p => ({ ...p, listId: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select a list..."/></SelectTrigger>
                                <SelectContent>
                                    {folders.map(folder => (
                                        <div key={folder.id}>
                                            <Label className="px-2 text-xs text-muted-foreground">{folder.name}</Label>
                                            {lists.filter(l => l.folderId === folder.id).map(list => (
                                                <SelectItem key={list.id} value={list.id!}>{list.name}</SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={editingEvent?.type} onValueChange={(v: PlannerTask['type']) => setEditingEvent(p => ({ ...p, type: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="study-session">Study Session</SelectItem>
                                    <SelectItem value="assignment-deadline">Assignment</SelectItem>
                                    <SelectItem value="quiz-reminder">Quiz</SelectItem>
                                    <SelectItem value="exam-prep">Exam Prep</SelectItem>
                                    <SelectItem value="habit">Habit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={editingEvent?.title || ''} onChange={e => setEditingEvent(p => ({ ...p, title: e.target.value }))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" value={editingEvent?.description || ''} onChange={e => setEditingEvent(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Time</Label>
                                <Input id="startTime" type="time" value={editingEvent?.time || ''} onChange={e => setEditingEvent(p => ({ ...p, time: e.target.value }))} />
                            </div>
                             <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={editingEvent?.priority} onValueChange={(v: PlannerTask['priority']) => setEditingEvent(p => ({ ...p, priority: v }))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="estimatedPomo">Estimated Pomodoro Sessions</Label>
                            <Input id="estimatedPomo" type="number" value={editingEvent?.estimatedPomo || ''} onChange={e => setEditingEvent(p => ({ ...p, estimatedPomo: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-2 pt-4 border-t">
                            <Label>Checklist / Sub-tasks</Label>
                            <div className="space-y-2">
                                {editingEvent?.checkItems?.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <Checkbox 
                                            id={`check-${item.id}`} 
                                            checked={item.isCompleted} 
                                            onCheckedChange={(checked) => {
                                                const newCheckItems = [...(editingEvent?.checkItems || [])];
                                                newCheckItems[index].isCompleted = !!checked;
                                                setEditingEvent(p => ({ ...p, checkItems: newCheckItems }));
                                            }}
                                        />
                                        <Input 
                                            value={item.text}
                                            onChange={(e) => {
                                                const newCheckItems = [...(editingEvent?.checkItems || [])];
                                                newCheckItems[index].text = e.target.value;
                                                setEditingEvent(p => ({ ...p, checkItems: newCheckItems }));
                                            }}
                                            className="h-8"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                            const newCheckItems = (editingEvent?.checkItems || []).filter(ci => ci.id !== item.id);
                                            setEditingEvent(p => ({ ...p, checkItems: newCheckItems }));
                                        }}>
                                            <X className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => {
                                const newCheckItem: CheckItem = { id: `new_${Date.now()}`, text: '', isCompleted: false };
                                setEditingEvent(p => ({ ...p, checkItems: [...(p?.checkItems || []), newCheckItem] }));
                            }}>
                                Add Sub-task
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTask}>Save Task</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isAiPlanOpen} onOpenChange={setIsAiPlanOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Study Plan with AI</DialogTitle>
                        <DialogDescription>Select the courses you want to include in your study plan.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Courses to Include</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">{aiPlanCourses.length > 0 ? aiPlanCourses.map(c => c.title).join(', ') : 'Select courses...'}</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search courses..." />
                                        <CommandEmpty>No course found.</CommandEmpty>
                                        <CommandGroup>
                                        {courses.map(course => (
                                            <CommandItem key={course.id} onSelect={() => {
                                                setAiPlanCourses(prev => prev.some(c => c.id === course.id) ? prev.filter(c => c.id !== course.id) : [...prev, course]);
                                            }}>
                                            <Check className={cn("mr-2 h-4 w-4", aiPlanCourses.some(c=>c.id === course.id) ? "opacity-100" : "opacity-0")} />
                                            {course.title}
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div><Label>Start Date</Label><DatePicker date={aiPlanStartDate} setDate={setAiPlanStartDate}/></div>
                            <div><Label>End Date</Label><DatePicker date={aiPlanEndDate} setDate={setAiPlanEndDate}/></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAiPlanOpen(false)}>Cancel</Button>
                        <Button onClick={handleGenerateAiPlan} disabled={isGeneratingPlan}>
                            {isGeneratingPlan && <Loader2 className="mr-2 animate-spin"/>} Generate Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isAiExamPlanOpen} onOpenChange={setIsAiExamPlanOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Exam Prep Plan with AI</DialogTitle>
                        <DialogDescription>Describe the exam syllabus and set the exam date.</DialogDescription>
                    </DialogHeader>
                     <div className="space-y-4">
                        <div>
                            <Label>Syllabus / Course Context</Label>
                            <TextareaAI placeholder="e.g., Physics 1st Paper, Chapters 1-5" value={aiExamCourseContext} onChange={e => setAiExamCourseContext(e.target.value)} />
                        </div>
                        <div>
                            <Label>Exam Date</Label>
                            <DatePicker date={aiExamDate} setDate={setAiExamDate} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAiExamPlanOpen(false)}>Cancel</Button>
                        <Button onClick={handleGenerateExamPlan} disabled={isGeneratingPlan}>
                             {isGeneratingPlan && <Loader2 className="mr-2 animate-spin"/>} Generate Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
