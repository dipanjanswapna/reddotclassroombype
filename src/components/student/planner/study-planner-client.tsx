

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { StudyPlanEvent, StudyPlanInput } from '@/ai/schemas/study-plan-schemas';
import { saveStudyPlanAction } from '@/app/actions/user.actions';
import { generateStudyPlan } from '@/ai/flows/study-plan-flow';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Wand2, PlusCircle, BarChart, BookOpen, CheckCircle } from 'lucide-react';
import { TaskItem } from './task-item';
import { PomodoroTimer } from './pomodoro-timer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function StudyPlannerClient({ initialEvents, plannerInput }: { initialEvents: StudyPlanEvent[], plannerInput: StudyPlanInput | null }) {
    const { toast } = useToast();
    const { userInfo, refreshUserInfo } = useAuth();
    const [events, setEvents] = useState<StudyPlanEvent[]>(initialEvents);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isGenerating, setIsGenerating] = useState(false);

    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<StudyPlanEvent> | null>(null);

    const eventsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return events.filter(e => e.date === dateStr);
    }, [events, selectedDate]);

    const handleGeneratePlan = async () => {
        if (!plannerInput) {
            toast({ title: "Cannot generate plan", description: "Course data is not available.", variant: "destructive" });
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateStudyPlan(plannerInput);
            setEvents(result.events.map(e => ({ ...e, id: `ai_${Math.random()}` }))); // Add temporary IDs
            if(userInfo) {
                await saveStudyPlanAction(userInfo.uid, result.events);
                await refreshUserInfo();
            }
            toast({ title: 'Success', description: 'Your new study plan has been generated.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to generate study plan.', variant: 'destructive' });
        }
        setIsGenerating(false);
    };

    const handleSavePlan = async () => {
        if (!userInfo) return;
        const result = await saveStudyPlanAction(userInfo.uid, events);
        if (result.success) {
            toast({ title: 'Plan Saved!', description: 'Your study plan has been saved to your profile.'});
            await refreshUserInfo();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    }
    
    const openTaskDialog = (event: Partial<StudyPlanEvent> | null) => {
        setEditingEvent(event ? {...event} : { date: format(selectedDate || new Date(), 'yyyy-MM-dd'), type: 'study-session', priority: 'Medium', estimatedPomos: 1 });
        setIsTaskDialogOpen(true);
    };
    
    const saveTask = () => {
        if (!editingEvent?.title) return;
        
        setEvents(prev => {
            if (editingEvent.id) { // Existing event
                return prev.map(e => e.id === editingEvent.id ? editingEvent as StudyPlanEvent : e);
            } else { // New event
                return [...prev, { ...editingEvent, id: `manual_${Date.now()}` } as StudyPlanEvent];
            }
        });
        setIsTaskDialogOpen(false);
    }
    
    const deleteTask = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    };

    const analytics = useMemo(() => {
        const totalTasks = events.length;
        const studySessions = events.filter(e => e.type === 'study-session');
        const courseCounts = studySessions.reduce((acc, session) => {
            if (session.courseTitle) {
                acc[session.courseTitle] = (acc[session.courseTitle] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        const mostStudied = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return {
            totalTasks,
            totalStudySessions: studySessions.length,
            mostStudied,
        }
    }, [events]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">AI Study Planner</h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        Organize your study schedule, track your tasks, and stay productive.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleGeneratePlan} disabled={isGenerating || !plannerInput}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate with AI
                    </Button>
                    <Button onClick={handleSavePlan} variant="outline">Save Plan</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Study Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                <CheckCircle className="h-8 w-8 text-primary"/>
                                <div>
                                    <p className="text-2xl font-bold">{analytics.totalTasks}</p>
                                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                <BookOpen className="h-8 w-8 text-primary"/>
                                <div>
                                    <p className="text-2xl font-bold">{analytics.totalStudySessions}</p>
                                    <p className="text-sm text-muted-foreground">Study Sessions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                <BarChart className="h-8 w-8 text-primary"/>
                                <div>
                                    <p className="text-lg font-bold truncate">{analytics.mostStudied}</p>
                                    <p className="text-sm text-muted-foreground">Most Studied</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan for {selectedDate ? format(selectedDate, 'PPP') : 'Today'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {eventsForSelectedDate.map(event => (
                                    <TaskItem key={event.id} event={event} onEdit={() => openTaskDialog(event)} onDelete={() => deleteTask(event.id!)}/>
                                ))}
                                {eventsForSelectedDate.length === 0 && <p className="text-muted-foreground">No plans for this day.</p>}
                            </div>
                             <Button variant="outline" className="w-full mt-4" onClick={() => openTaskDialog(null)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add Task
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <Card>
                         <CardContent className="p-2 sm:p-4 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md"
                                modifiers={{ events: events.map(e => new Date(e.date)) }}
                                modifiersClassNames={{ events: "bg-primary/20 rounded-full" }}
                            />
                        </CardContent>
                    </Card>
                    <PomodoroTimer courses={plannerInput?.courses || []} />
                </div>
            </div>

             <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEvent?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={editingEvent?.title || ''} onChange={e => setEditingEvent(p => ({ ...p, title: e.target.value }))} />
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
