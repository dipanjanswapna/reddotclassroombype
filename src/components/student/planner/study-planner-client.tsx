
'use client';

import { useState, useMemo, useCallback } from 'react';
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
  lastDayOfWeek,
} from 'date-fns';
import { StudyPlanEvent, StudyPlanInput } from '@/lib/types';
import { saveStudyPlanAction } from '@/app/actions/user.actions';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, ChevronLeft, ChevronRight, Calendar, ListChecks, CalendarDays } from 'lucide-react';
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


type ViewMode = 'month' | 'week' | 'day';
type InsightView = 'Daily' | 'Weekly' | 'Monthly';

export function StudyPlannerClient({ initialEvents, plannerInput }: { initialEvents: StudyPlanEvent[], plannerInput: StudyPlanInput | null }) {
    const { toast } = useToast();
    const { userInfo, refreshUserInfo } = useAuth();
    const [events, setEvents] = useState<StudyPlanEvent[]>(initialEvents);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<StudyPlanEvent> | null>(null);

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

    const handleSavePlan = useCallback(async (updatedEvents?: StudyPlanEvent[]) => {
        if (!userInfo) return;
        const eventsToSave = updatedEvents || events;
        const result = await saveStudyPlanAction(userInfo.uid, eventsToSave);
        if (result.success) {
            toast({ title: 'Plan Saved!', description: 'Your study plan has been updated.'});
            await refreshUserInfo();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    }, [events, userInfo, refreshUserInfo, toast]);
    
    const handleTaskUpdate = useCallback((updatedEvent: StudyPlanEvent) => {
        setEvents(prev => {
            const newEvents = prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
            handleSavePlan(newEvents);
            return newEvents;
        });
    }, [handleSavePlan]);

    const handleSessionComplete = useCallback((taskId: string) => {
        setEvents(prev => {
            const newEvents = prev.map(e => {
                if (e.id === taskId) {
                    return { ...e, completedPomos: (e.completedPomos || 0) + 1 };
                }
                return e;
            });
            handleSavePlan(newEvents);
            return newEvents;
        });
    }, [handleSavePlan]);
    
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

    const handleDateNavigation = (direction: 'prev' | 'next') => {
        if (viewMode === 'month') {
            setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        } else if (viewMode === 'week') {
            setCurrentDate(direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7));
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

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
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
