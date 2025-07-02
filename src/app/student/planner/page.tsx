
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, List, Wand2, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { Course, Enrollment, Assignment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { addDays, format, parseISO, startOfDay } from 'date-fns';
import { generateStudyPlan } from '@/ai/flows/study-plan-flow';
import { StudyPlanEventSchema } from '@/ai/schemas/study-plan-schemas';
import type { z } from 'genkit';
import { Badge } from '@/components/ui/badge';

type StudyPlanEvent = z.infer<typeof StudyPlanEventSchema> & {
    id: string;
};

const getEventTypeStyles = (type: StudyPlanEvent['type']) => {
    switch (type) {
        case 'study-session':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300';
        case 'assignment-deadline':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300';
        case 'quiz-reminder':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300';
        case 'exam-prep':
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200';
    }
}

export default function PlannerPage() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [studyPlan, setStudyPlan] = useState<StudyPlanEvent[]>([]);

    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
    
    useEffect(() => {
        if (!userInfo) return;

        const fetchInitialData = async () => {
            try {
                const [allCourses, enrollments] = await Promise.all([
                    getCourses(),
                    getEnrollmentsByUserId(userInfo.uid),
                ]);

                const studentCourses = allCourses.filter(c => enrollments.some(e => e.courseId === c.id));
                setEnrolledCourses(studentCourses);
                
                const studentAssignments = studentCourses.flatMap(c => c.assignments || []).filter(a => a.studentId === userInfo.uid);
                setAssignments(studentAssignments);

            } catch (error) {
                console.error("Failed to load planner data:", error);
                toast({ title: 'Error', description: 'Could not load your course data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [userInfo, toast]);
    
    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        try {
            const courseInfo = enrolledCourses.map(c => ({
                id: c.id!,
                title: c.title,
                topics: c.syllabus?.map(s => s.title) || [],
            }));

            const deadlineInfo = assignments
                .filter(a => new Date(a.deadline as string) >= new Date())
                .map(a => {
                    const course = enrolledCourses.find(c => c.assignments?.some(as => as.id === a.id));
                    return {
                        courseTitle: course?.title || 'Unknown Course',
                        assignmentTitle: a.title,
                        deadline: format(new Date(a.deadline as string), 'yyyy-MM-dd'),
                    }
                });
            
            const input = {
                courses: courseInfo,
                deadlines: deadlineInfo,
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // Plan for the next 30 days
            };
            
            const result = await generateStudyPlan(input);
            setStudyPlan(result.events.map(e => ({...e, id: Math.random().toString()})).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            toast({ title: 'Study Plan Generated!', description: 'Your personalized 30-day study plan is ready.' });

        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to generate study plan.', variant: 'destructive' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const eventsForSelectedDay = useMemo(() => {
        if (!selectedDate) return [];
        return studyPlan.filter(event => startOfDay(parseISO(event.date)).getTime() === startOfDay(selectedDate).getTime());
    }, [studyPlan, selectedDate]);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Study Planner</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Organize your learning and never miss a deadline.</p>
                </div>
                <Button onClick={handleGeneratePlan} disabled={isGenerating || enrolledCourses.length === 0}>
                    {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2"/>}
                    Generate 30-Day Plan with AI
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calendar/> Calendar</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <CalendarPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border p-0"
                                modifiers={{
                                    hasEvent: studyPlan.map(e => parseISO(e.date))
                                }}
                                modifiersStyles={{
                                    hasEvent: {
                                        fontWeight: 'bold',
                                        color: 'hsl(var(--primary))',
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><List/> Tasks for {selectedDate ? format(selectedDate, 'PPP') : 'Today'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           {studyPlan.length === 0 ? (
                               <div className="text-center text-muted-foreground py-8">
                                   <Info className="mx-auto w-8 h-8 mb-2"/>
                                   <p>Generate a study plan with AI to see your tasks here.</p>
                               </div>
                           ) : eventsForSelectedDay.length > 0 ? (
                               <div className="space-y-4">
                                   {eventsForSelectedDay.map(event => (
                                       <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeStyles(event.type)}`}>
                                           <Badge variant="outline" className="mb-2 bg-background capitalize">{event.type.replace('-', ' ')}</Badge>
                                           <p className="font-semibold">{event.title}</p>
                                           <p className="text-xs">{event.courseTitle}</p>
                                           {event.description && <p className="text-xs mt-1">{event.description}</p>}
                                       </div>
                                   ))}
                               </div>
                           ) : (
                                <p className="text-muted-foreground text-center py-8">No tasks scheduled for this day.</p>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
