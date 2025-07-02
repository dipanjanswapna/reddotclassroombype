
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Course, Assignment } from '@/lib/types';
import { CalendarClock, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format, isPast, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type AssignmentWithCourse = Assignment & {
  courseTitle: string;
};

export default function DeadlinesPage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading } = useAuth();
    const [assignments, setAssignments] = useState<AssignmentWithCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchDeadlines = async () => {
            try {
                const [allCourses, enrollments] = await Promise.all([
                    getCourses(),
                    getEnrollmentsByUserId(userInfo.uid)
                ]);

                const enrolledCourseIds = enrollments.map(e => e.courseId);
                const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id!));
                
                const studentAssignments = enrolledCourses
                    .flatMap(course => 
                        (course.assignments || []).map(assignment => ({
                            ...assignment,
                            courseTitle: course.title
                        }))
                    )
                    .filter(a => a.studentId === userInfo.uid && (a.status === 'Pending' || a.status === 'Late'))
                    .sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime());
                
                setAssignments(studentAssignments);

            } catch (error) {
                console.error("Failed to fetch deadlines:", error);
                toast({ title: "Error", description: "Could not load deadline data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchDeadlines();
    }, [authLoading, userInfo, toast]);

    const getDaysLeft = (deadline: string) => {
        const diff = differenceInDays(new Date(deadline), new Date());
        if (diff < 0) return { text: 'Overdue', color: 'text-destructive' };
        if (diff === 0) return { text: 'Due today', color: 'text-orange-500' };
        if (diff === 1) return { text: 'Due tomorrow', color: 'text-yellow-500' };
        return { text: `${diff} days left`, color: 'text-green-600' };
    };
    
    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
             <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Upcoming Deadlines</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Stay on top of your assignments and quizzes.
                </p>
            </div>
            
            {assignments.length > 0 ? (
                <div className="space-y-4">
                    {assignments.map(assignment => {
                        const daysLeftInfo = getDaysLeft(assignment.deadline as string);
                        return (
                            <Card key={assignment.id}>
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-muted rounded-full">
                                            <FileText className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{assignment.title}</p>
                                            <p className="text-sm text-muted-foreground">{assignment.courseTitle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{format(new Date(assignment.deadline as string), 'PPP')}</p>
                                        <p className={`text-sm font-medium ${daysLeftInfo.color}`}>{daysLeftInfo.text}</p>
                                        {assignment.status === 'Late' && <Badge variant="destructive" className="mt-1">Late</Badge>}
                                    </div>
                                    <Button asChild><Link href={`/student/my-courses/${assignment.courseId}/assignments`}>Submit</Link></Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-muted rounded-lg">
                    <CalendarClock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">You have no upcoming deadlines. You're all caught up!</p>
                </div>
            )}
        </div>
    );
}
