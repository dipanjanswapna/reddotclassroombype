
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
} from 'date-fns';
import { Course, Folder, List, PlannerTask } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, ChevronLeft, ChevronRight, BrainCircuit, BarChart, Settings, Folder as FolderIcon, List as ListIcon, Edit, Trash2, Calendar, Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { WeekView } from '@/components/student/planner/week-view';
import { DayView } from '@/components/student/planner/day-view';
import { generateStudyPlan } from '@/ai/flows/study-plan-flow';
import { PomodoroTimer } from './pomodoro-timer';
import { ProgressChart } from './progress-chart';
import { generateExamPrepPlan } from '@/ai/flows/exam-prep-flow';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { saveFolder, saveList, deleteTask, saveTask, deleteFolder, deleteList } from '@/app/actions/planner.actions';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/loading-spinner';
import { DatePicker } from '@/components/ui/date-picker';
import { TaskItem } from './task-item';
import { Textarea } from '@/components/ui/textarea';

type ViewMode = 'month' | 'week' | 'day';

interface StudyPlannerClientProps {
    initialTasks: PlannerTask[];
    initialFolders: Folder[];
    initialLists: List[];
    courses: Course[];
}


export function StudyPlannerClient({ initialTasks, initialFolders, initialLists, courses }: StudyPlannerClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    
    const [events, setEvents] = useState<PlannerTask[]>(initialTasks);
    const [folders, setFolders] = useState<Folder[]>(initialFolders);
    const [lists, setLists] = useState<List[]>(initialLists);
    
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<PlannerTask> | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [activeView, setActiveView] = useState('planner');
    
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [isFolderListOpen, setIsFolderListOpen] = useState(true);

    const [durations, setDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            setLoading(false);
        }
    }, [authLoading]);

    const firstDayOfMonth = startOfMonth(currentDate);
    const calendarDays = useMemo(() => {
        const start = startOfWeek(firstDayOfMonth);
        const end = endOfWeek(addDays(firstDayOfMonth, 35));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);
    
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

    const eventsForSelectedDate = useMemo(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return filteredEvents.filter(e => e.date === dateStr).sort((a,b) => (a.time || '').localeCompare(b.time || ''));
    }, [filteredEvents, selectedDate]);
    
    const openTaskDialog = (event: Partial<PlannerTask> | null) => {
        const defaultListId = selectedListId || lists.find(l => l.folderId === selectedFolderId)?.id || lists[0]?.id;
        setEditingEvent(event ? {...event} : { date: format(selectedDate || new Date(), 'yyyy-MM-dd'), type: 'study-session', priority: 'medium', listId: defaultListId, userId: userInfo?.uid });
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
        await deleteTask(eventId);
        setEvents(events.filter(e => e.id !== eventId));
    };
    
    const handleDateNavigation = (direction: 'prev' | 'next') => {
        if (viewMode === 'month') {
            setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        } else if (viewMode === 'week') {
            const newDate = direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7);
            setCurrentDate(newDate);
            setSelectedDate(newDate);
        } else {
            const newSelectedDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
            setSelectedDate(newSelectedDate);
            setCurrentDate(newSelectedDate);
        }
    }
    
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
            await saveTask({ ...task, actualPomo: newActualPomo });
            setEvents(prev => prev.map(e => e.id === taskId ? { ...e, actualPomo: newActualPomo } : e));
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

    const renderCalendarView = () => {
        switch (viewMode) {
            case 'week':
                return <WeekView currentDate={currentDate} events={filteredEvents} onSelectDate={setSelectedDate} selectedDate={selectedDate}/>;
            case 'day':
                return <DayView selectedDate={selectedDate} events={eventsForSelectedDate} onEdit={openTaskDialog} onDelete={handleDeleteTask} />;
            case 'month':
            default:
                return (
                    <>
                        <div className="grid grid-cols-7 text-center font-semibold text-muted-foreground text-sm">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 mt-2">
                            {calendarDays.map(day => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const eventsOnDay = filteredEvents.filter(e => e.date === dateStr);
                                return (
                                    <div 
                                        key={day.toString()} 
                                        className={cn(
                                            "h-28 border rounded-md p-2 text-sm flex flex-col cursor-pointer overflow-hidden",
                                            isSameMonth(day, currentDate) ? 'bg-background hover:bg-muted/50' : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                                            isSameDay(day, new Date()) && 'bg-blue-100 dark:bg-blue-900/30',
                                            isSameDay(day, selectedDate) && 'border-2 border-primary'
                                        )}
                                        onClick={() => {
                                            setSelectedDate(day);
                                            setViewMode('day');
                                        }}
                                    >
                                        <span className="font-semibold">{format(day, 'd')}</span>
                                        <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-1 no-scrollbar">
                                            {eventsOnDay.slice(0, 2).map(e => (
                                                <div key={e.id} className="p-1 bg-primary/10 text-primary rounded truncate">
                                                    {e.title}
                                                </div>
                                            ))}
                                            {eventsOnDay.length > 2 && <div className="text-xs text-muted-foreground">+{eventsOnDay.length - 2} more</div>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                );
        }
    }
    
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
                                        className={cn("flex items-center justify-between p-2 rounded-md cursor-pointer", selectedFolderId === folder.id && !selectedListId && 'bg-accent')}
                                        onClick={() => {setSelectedFolderId(folder.id); setSelectedListId(null);}}
                                    >
                                        <span className="flex items-center gap-2"><FolderIcon className="h-4 w-4"/> {folder.name}</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteFolder(folder.id!)}}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                    </div>
                                    <div className="pl-6 space-y-1 mt-1">
                                        {lists.filter(l => l.folderId === folder.id).map(list => (
                                            <div key={list.id} className={cn("flex items-center justify-between p-1 rounded-md cursor-pointer text-sm", selectedListId === list.id && 'bg-accent')} onClick={() => {setSelectedFolderId(folder.id!); setSelectedListId(list.id!);}}>
                                                 <span className="flex items-center gap-2 text-muted-foreground"><ListIcon className="h-4 w-4"/> {list.name}</span>
                                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteList(list.id!)}}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => handleAddList(folder.id!)}><PlusCircle className="mr-2 h-3 w-3"/>Add List</Button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </CardContent>
                     </Card>
                     <PomodoroTimer tasksForToday={eventsForSelectedDate} onSessionComplete={handlePomoSessionComplete} durations={durations} setDurations={setDurations}/>
                 </aside>
                <main className="lg:col-span-3">
                   <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" onClick={() => handleDateNavigation('prev')}><ChevronLeft/></Button>
                                    <h2 className="text-xl font-bold text-center w-48">{format(viewMode === 'day' ? selectedDate : currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'PPP')}</h2>
                                    <Button variant="outline" size="icon" onClick={() => handleDateNavigation('next')}><ChevronRight/></Button>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button variant="outline" onClick={() => openTaskDialog(null)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                                    </Button>
                                    <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">Month</SelectItem>
                                            <SelectItem value="week">Week</SelectItem>
                                            <SelectItem value="day">Day</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                        {renderCalendarView()}
                        </CardContent>
                    </Card>
                </main>
            </div>
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
                                 <Button onClick={handleGoogleCalendarSync}><Calendar className="mr-2 h-4 w-4"/>Sync Now</Button>
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
                    <div className="grid gap-4 py-4">
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTask}>Save Task</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
