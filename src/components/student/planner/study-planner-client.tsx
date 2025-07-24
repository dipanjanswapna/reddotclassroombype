
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
import { StudyPlanEvent, User } from '@/lib/types';
import { saveUserAction } from '@/app/actions/user.actions';
import { getUsers } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, ChevronLeft, ChevronRight, CalendarDays, ListChecks, Check, Users as UsersIcon, X, Repeat, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import { TaskItem } from '@/components/student/planner/task-item';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { WeekView } from '@/components/student/planner/week-view';
import { DayView } from '@/components/student/planner/day-view';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';

type ViewMode = 'month' | 'week' | 'day';

export function StudyPlannerClient() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    
    const [events, setEvents] = useState<StudyPlanEvent[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<StudyPlanEvent> | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    const firstDayOfMonth = startOfMonth(currentDate);
    const calendarDays = useMemo(() => {
        const start = startOfWeek(firstDayOfMonth);
        const end = endOfWeek(addDays(firstDayOfMonth, 35));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // This effect handles the initial data loading.
    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        };

        const fetchInitialData = async () => {
            try {
                const fetchedUsers = await getUsers();
                setAllUsers(fetchedUsers);
                
                // Set events from user's profile
                setEvents(userInfo.studyPlan || []);
            } catch (error) {
                console.error("Failed to load initial planner data:", error);
                toast({ title: 'Error', description: 'Could not load planner data.' });
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [userInfo, authLoading, toast]);


    const handleSavePlan = useCallback(async (updatedEvents?: StudyPlanEvent[]) => {
        if (!userInfo) return;
        const eventsToSave = updatedEvents || events;
        await saveUserAction({id: userInfo.uid, studyPlan: eventsToSave});
        // No toast on success to avoid being too noisy
    }, [events, userInfo]);

    const eventsForSelectedDate = useMemo(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return events.filter(e => e.date === dateStr);
    }, [events, selectedDate]);
    
    const openTaskDialog = (event: Partial<StudyPlanEvent> | null) => {
        setEditingEvent(event ? {...event} : { date: format(selectedDate || new Date(), 'yyyy-MM-dd'), type: 'study-session', priority: 'Medium' });
        setIsTaskDialogOpen(true);
    };
    
    const saveTask = () => {
        if (!editingEvent?.title) return;
        
        const newEvents = editingEvent.id
            ? events.map(e => e.id === editingEvent.id ? editingEvent as StudyPlanEvent : e)
            : [...events, { ...editingEvent, id: `manual_${Date.now()}` } as StudyPlanEvent];
            
        setEvents(newEvents);
        handleSavePlan(newEvents);
        setIsTaskDialogOpen(false);
    }
    
    const deleteTask = (eventId: string) => {
        const newEvents = events.filter(e => e.id !== eventId);
        setEvents(newEvents);
        handleSavePlan(newEvents);
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

    const renderCalendarView = () => {
        switch (viewMode) {
            case 'week':
                return <WeekView currentDate={currentDate} events={events} onSelectDate={setSelectedDate} selectedDate={selectedDate}/>;
            case 'day':
                return <DayView selectedDate={selectedDate} events={eventsForSelectedDate} onEdit={openTaskDialog} onDelete={deleteTask} />;
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
                                const eventsOnDay = events.filter(e => e.date === dateStr);
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
        return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!userInfo) {
        return <div>Please log in to use the planner.</div>;
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
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" onClick={() => handleDateNavigation('prev')}><ChevronLeft/></Button>
                                    <h2 className="text-xl font-bold text-center w-48">{format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'PPP')}</h2>
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
                </div>

                 <div className="xl:col-span-1 space-y-8">
                    {/* Placeholder for Pomodoro and other widgets */}
                </div>
            </div>

             <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEvent?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={editingEvent?.type} onValueChange={(v: StudyPlanEvent['type']) => setEditingEvent(p => ({ ...p, type: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="study-session">Study Session</SelectItem>
                                    <SelectItem value="assignment-deadline">Assignment</SelectItem>
                                    <SelectItem value="quiz-reminder">Quiz</SelectItem>
                                    <SelectItem value="exam-prep">Exam Prep</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={editingEvent?.title || ''} onChange={e => setEditingEvent(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input id="startTime" type="time" value={editingEvent?.time || ''} onChange={e => setEditingEvent(p => ({ ...p, time: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveTask}>Save Task</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
