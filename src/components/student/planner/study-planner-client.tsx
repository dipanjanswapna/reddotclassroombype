
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
  getMonth,
  getWeek,
} from 'date-fns';
import { StudyPlanEvent, User } from '@/lib/types';
import { saveUserAction, getUsers, getEnrollmentsByUserId, getCoursesByIds } from '@/app/actions/user.actions';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, ChevronLeft, ChevronRight, Calendar, ListChecks, CalendarDays, Check, Users as UsersIcon, X, WifiOff } from 'lucide-react';
import { PomodoroTimer } from './pomodoro-timer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { WeekView } from './week-view';
import { DayView } from './day-view';
import { ProgressChart } from './progress-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { safeToDate } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';


type ViewMode = 'month' | 'week' | 'day';
type InsightView = 'Daily' | 'Weekly' | 'Monthly';

export function StudyPlannerClient() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    
    const [events, setEvents] = useState<StudyPlanEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<StudyPlanEvent> | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [insightView, setInsightView] = useState<InsightView>('Daily');

    const [pomodoroDurations, setPomodoroDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });

    const firstDayOfMonth = startOfMonth(currentDate);
    const calendarDays = useMemo(() => {
        const start = startOfWeek(firstDayOfMonth);
        const end = endOfWeek(addDays(firstDayOfMonth, 35));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // This effect handles the initial data loading and offline fallback.
    useEffect(() => {
        if (authLoading) return;
        if (!userInfo) {
            setLoading(false);
            return;
        }

        const fetchPlannerData = async () => {
            setLoading(true);
            try {
                // Fetch fresh data from server
                const [enrollments, allUsersData] = await Promise.all([
                    getEnrollmentsByUserId(userInfo.uid),
                    getUsers(),
                ]);
                const courseIds = enrollments.map(e => e.courseId);
                const courses = await getCoursesByIds(courseIds);
                setAllUsers(allUsersData);
                
                const assignmentEvents: StudyPlanEvent[] = courses.flatMap(course => (course.assignments || []).filter(a => a.studentId === userInfo.uid && a.deadline).map(a => ({ id: `as_${a.id}`, date: format(safeToDate(a.deadline), 'yyyy-MM-dd'), title: `Deadline: ${a.title}`, type: 'assignment-deadline' as const, courseTitle: course.title, priority: 'High' })));
                const examEvents: StudyPlanEvent[] = courses.flatMap(course => (course.exams || []).filter(e => e.studentId === userInfo.uid && e.examDate).map(e => ({ id: `ex_${e.id}`, date: format(safeToDate(e.examDate), 'yyyy-MM-dd'), title: `Exam: ${e.title}`, type: 'exam-prep' as const, courseTitle: course.title, priority: 'High' })));
                const liveClassEvents: StudyPlanEvent[] = courses.flatMap(course => (course.liveClasses || []).filter(lc => lc.date).map(lc => ({ id: `lc_${lc.id}`, date: lc.date, time: lc.time, title: `Live Class: ${lc.topic}`, type: 'live-class' as const, courseTitle: course.title, priority: 'Medium' })));
                
                const manualEvents = (userInfo.studyPlan || []);
                const allEvents = [...manualEvents, ...assignmentEvents, ...examEvents, ...liveClassEvents];
                const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());
                
                setEvents(uniqueEvents);
                localStorage.setItem(`studyPlan_${userInfo.uid}`, JSON.stringify(uniqueEvents));
                setIsOffline(false);

            } catch (error) {
                console.warn("Failed to fetch planner data, attempting to load from cache.", error);
                const cachedData = localStorage.getItem(`studyPlan_${userInfo.uid}`);
                if (cachedData) {
                    setEvents(JSON.parse(cachedData));
                    toast({ title: "Offline Mode", description: "Displaying cached data. Your changes will sync when you're back online."});
                }
                setIsOffline(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPlannerData();
    }, [userInfo, authLoading, toast]);


    const handleSavePlan = useCallback(async (updatedEvents?: StudyPlanEvent[]) => {
        if (!userInfo) return;
        const eventsToSave = updatedEvents || events;
        
        // Always save to local storage immediately for offline resilience
        localStorage.setItem(`studyPlan_${userInfo.uid}`, JSON.stringify(eventsToSave));
        
        try {
            await saveUserAction({id: userInfo.uid, studyPlan: eventsToSave});
            if (isOffline) {
                toast({ title: 'Back Online!', description: 'Your changes have been successfully synced.' });
                setIsOffline(false);
            }
            // No success toast in online mode to avoid being too noisy
            await refreshUserInfo();
        } catch (error) {
            setIsOffline(true);
            toast({ title: 'Offline Mode', description: "Your changes are saved locally and will sync when you're back online.", variant: 'default' });
        }
    }, [events, userInfo, isOffline, refreshUserInfo, toast]);

    const eventsForSelectedDate = useMemo(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return events.filter(e => e.date === dateStr);
    }, [events, selectedDate]);
    
    const totalStudyTimeForSelectedDate = useMemo(() => {
        return eventsForSelectedDate.reduce((total, event) => {
            return total + (event.completedPomos || 0) * pomodoroDurations.work;
        }, 0);
    }, [eventsForSelectedDate, pomodoroDurations.work]);

    
    const progressData = useMemo(() => {
        const getMinutes = (dayEvents: StudyPlanEvent[]) => {
            const totalPomos = dayEvents.reduce((sum, e) => sum + (e.completedPomos || 0), 0);
            return totalPomos * pomodoroDurations.work;
        };
        
        const referenceDate = viewMode === 'month' ? currentDate : selectedDate;

        if (insightView === 'Daily') {
             const endOfSelectedWeek = endOfWeek(referenceDate);
             const startOfSelectedWeek = startOfWeek(referenceDate);
             const weekInterval = eachDayOfInterval({ start: startOfSelectedWeek, end: endOfSelectedWeek });

            return weekInterval.map(day => ({
                name: format(day, 'EEE'),
                minutes: getMinutes(events.filter(e => e.date === format(day, 'yyyy-MM-dd'))),
            }));
        }
        if (insightView === 'Weekly') {
            const weeklyData: { [key: string]: number } = {};
            for (let i = 3; i >= 0; i--) {
                const weekStartDate = subDays(referenceDate, i * 7);
                const weekKey = `W${getWeek(weekStartDate, { weekStartsOn: 1 })}`;
                weeklyData[weekKey] = 0;
            }
            events.forEach(e => {
                const eventDate = new Date(e.date);
                const weekKey = `W${getWeek(eventDate, { weekStartsOn: 1 })}`;
                if(weeklyData[weekKey] !== undefined) {
                    weeklyData[weekKey] += (e.completedPomos || 0) * pomodoroDurations.work;
                }
            });
            return Object.entries(weeklyData).map(([name, minutes]) => ({ name, minutes }));
        }
        if (insightView === 'Monthly') {
            const monthlyData: { [key: string]: number } = {};
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 5; i >= 0; i--) {
                const monthDate = subMonths(referenceDate, i);
                const monthKey = monthNames[getMonth(monthDate)];
                monthlyData[monthKey] = 0;
            }
            events.forEach(e => {
                 const eventDate = new Date(e.date);
                 const monthKey = monthNames[getMonth(eventDate)];
                 if(monthlyData[monthKey] !== undefined) {
                    monthlyData[monthKey] += (e.completedPomos || 0) * pomodoroDurations.work;
                 }
            });
             return Object.entries(monthlyData).map(([name, minutes]) => ({ name, minutes }));
        }
        return [];
    }, [events, pomodoroDurations.work, insightView, currentDate, selectedDate, viewMode]);

    
    const handleTaskUpdate = useCallback((updatedEvent: StudyPlanEvent) => {
        const newEvents = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
        setEvents(newEvents);
        handleSavePlan(newEvents);
    }, [events, handleSavePlan]);

    const handleSessionComplete = useCallback((taskId: string) => {
        const newEvents = events.map(e => {
            if (e.id === taskId) {
                return { ...e, completedPomos: (e.completedPomos || 0) + 1 };
            }
            return e;
        });
        setEvents(newEvents);
        handleSavePlan(newEvents);
    }, [events, handleSavePlan]);
    
    const openTaskDialog = (event: Partial<StudyPlanEvent> | null) => {
        setEditingEvent(event ? {...event} : { date: format(selectedDate || new Date(), 'yyyy-MM-dd'), type: 'study-session', priority: 'Medium', estimatedPomos: 1, completedPomos: 0, time: '', endTime: '' });
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
    
    const handleParticipantToggle = (userId: string) => {
        setEditingEvent(prev => {
            if (!prev) return null;
            const currentParticipants = prev.participantIds || [];
            const newParticipants = currentParticipants.includes(userId)
                ? currentParticipants.filter(id => id !== userId)
                : [...currentParticipants, userId];
            return { ...prev, participantIds: newParticipants };
        });
    }

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
                return <DayView selectedDate={selectedDate} events={eventsForSelectedDate} onEdit={openTaskDialog} onDelete={deleteTask} onTaskUpdate={handleTaskUpdate} totalStudyTime={totalStudyTimeForSelectedDate} />;
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
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Study Planner</h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        Organize your schedule, track your tasks, and stay productive.
                    </p>
                </div>
                {isOffline && (
                    <Alert variant="destructive" className="w-fit">
                        <WifiOff className="h-4 w-4" />
                        <AlertTitle>You are offline!</AlertTitle>
                        <AlertDescription>Your changes are being saved locally.</AlertDescription>
                    </Alert>
                )}
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
                                            <SelectItem value="month"><CalendarDays className="mr-2 h-4 w-4"/>Month</SelectItem>
                                            <SelectItem value="week"><Calendar className="mr-2 h-4 w-4"/>Week</SelectItem>
                                            <SelectItem value="day"><ListChecks className="mr-2 h-4 w-4"/>Day</SelectItem>
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
                    <Card>
                        <CardHeader>
                           <CardTitle>Study Insights</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <Tabs value={insightView} onValueChange={(v) => setInsightView(v as InsightView)}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="Daily">Daily</TabsTrigger>
                                    <TabsTrigger value="Weekly">Weekly</TabsTrigger>
                                    <TabsTrigger value="Monthly">Monthly</TabsTrigger>
                                </TabsList>
                                <TabsContent value={insightView} className="mt-4">
                                     <ProgressChart data={progressData} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                    <PomodoroTimer 
                        tasksForToday={eventsForSelectedDate} 
                        onSessionComplete={handleSessionComplete}
                        durations={pomodoroDurations}
                        setDurations={setPomodoroDurations}
                    />
                </div>
            </div>

             <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto pr-2">
                    <DialogHeader>
                        <DialogTitle>{editingEvent?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={editingEvent?.title || ''} onChange={e => setEditingEvent(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="time">Start Time</Label>
                                <Input id="time" type="time" value={editingEvent?.time || ''} onChange={e => setEditingEvent(p => ({ ...p, time: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input id="endTime" type="time" value={editingEvent?.endTime || ''} onChange={e => setEditingEvent(p => ({ ...p, endTime: e.target.value }))} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={editingEvent?.type} onValueChange={(v) => setEditingEvent(p => ({ ...p, type: v as any }))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="study-session">Study Session</SelectItem>
                                    <SelectItem value="assignment-deadline">Assignment Deadline</SelectItem>
                                    <SelectItem value="quiz-reminder">Quiz Reminder</SelectItem>
                                    <SelectItem value="exam-prep">Exam Prep</SelectItem>
                                    <SelectItem value="live-class">Live Class</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={editingEvent?.priority} onValueChange={(v) => setEditingEvent(p => ({ ...p, priority: v as any }))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input id="description" value={editingEvent?.description || ''} onChange={e => setEditingEvent(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="resourceLink">Resource Link (Optional)</Label>
                            <Input id="resourceLink" value={editingEvent?.resourceLink || ''} onChange={e => setEditingEvent(p => ({ ...p, resourceLink: e.target.value }))} placeholder="https://example.com/notes.pdf"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="courseTitle">Course (Optional)</Label>
                            <Input id="courseTitle" value={editingEvent?.courseTitle || ''} onChange={e => setEditingEvent(p => ({ ...p, courseTitle: e.target.value }))} />
                        </div>
                         {(editingEvent?.type === 'study-session' || editingEvent?.type === 'exam-prep') && (
                             <div className="space-y-2">
                                <Label htmlFor="estimatedPomos">Estimated Pomodoros</Label>
                                <Input id="estimatedPomos" type="number" value={editingEvent?.estimatedPomos || 1} onChange={e => setEditingEvent(p => ({ ...p, estimatedPomos: Number(e.target.value) }))} />
                            </div>
                         )}
                         <div className="space-y-2">
                            <Label>Reminders (minutes before)</Label>
                            <p className="text-xs text-muted-foreground">Note: This feature is for planning. Actual notifications are not yet implemented.</p>
                            <Input placeholder="e.g., 10, 30" onChange={e => setEditingEvent(p => ({ ...p, reminders: e.target.value.split(',').map(Number) }))} />
                         </div>
                         <div className="space-y-2">
                            <Label>Participants</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <UsersIcon className="h-4 w-4 mr-2" />
                                            {editingEvent?.participantIds?.length ? (
                                                editingEvent.participantIds.map(id => {
                                                    const user = allUsers.find(u => u.uid === id);
                                                    return <Badge key={id} variant="secondary">{user?.name || id.slice(0,6)}</Badge>
                                                })
                                            ) : 'Add Participants'}
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search friends..." />
                                        <CommandEmpty>No users found.</CommandEmpty>
                                        <CommandGroup>
                                            {allUsers.filter(u => u.uid !== userInfo?.uid).map(user => (
                                                <CommandItem key={user.uid} onSelect={() => handleParticipantToggle(user.uid)}>
                                                    <Check className={cn("mr-2 h-4 w-4", editingEvent?.participantIds?.includes(user.uid) ? 'opacity-100' : 'opacity-0')} />
                                                    <Avatar className="h-6 w-6 mr-2"><AvatarImage src={user.avatarUrl} /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                                    {user.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
