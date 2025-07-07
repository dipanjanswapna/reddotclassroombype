
'use client';

import { useState, useEffect } from 'react';
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Course, Exam } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { ClipboardEdit, PlayCircle, Eye, BarChart3, Clock, CheckCircle } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { format, isPast } from 'date-fns';
import { safeToDate } from '@/lib/utils';

const getStatusBadgeVariant = (status: Exam['status']): VariantProps<typeof badgeVariants>['variant'] => {
    switch (status) {
        case 'Graded': return 'accent';
        case 'Submitted': return 'warning';
        case 'Pending':
        default: return 'secondary';
    }
};

type ExamWithCourse = Exam & {
    courseId: string;
    courseTitle: string;
};

export default function AllExamsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [exams, setExams] = useState<ExamWithCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        async function fetchExams() {
            try {
                const enrollments = await getEnrollmentsByUserId(userInfo.uid);
                const enrolledCourseIds = enrollments.map(e => e.courseId);

                if (enrolledCourseIds.length === 0) {
                    setExams([]);
                    setLoading(false);
                    return;
                }

                const allCourses = await getCourses();
                
                const studentExams = allCourses
                    .filter(course => course.id && enrolledCourseIds.includes(course.id))
                    .flatMap(course => 
                        (course.exams || []).filter(e => e.studentId === userInfo.uid).map(exam => ({
                            ...exam,
                            courseId: course.id!,
                            courseTitle: course.title,
                        }))
                    )
                    .sort((a, b) => safeToDate(a.examDate).getTime() - safeToDate(b.examDate).getTime());

                setExams(studentExams);
            } catch (error) {
                console.error("Failed to fetch exams:", error);
                toast({ title: 'Error', description: 'Could not load your exams.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        }
        fetchExams();
    }, [userInfo, authLoading, toast]);

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
                <h1 className="font-headline text-3xl font-bold tracking-tight">My Exams</h1>
                <p className="mt-1 text-lg text-muted-foreground">View all your upcoming and completed exams in one place.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Scheduled Exams</CardTitle>
                    <CardDescription>This list includes exams from all the courses you are currently enrolled in.</CardDescription>
                </CardHeader>
                <CardContent>
                    {exams.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exam</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.map((exam) => {
                                    const examDate = safeToDate(exam.examDate);
                                    const isUpcoming = examDate > new Date();
                                    const isTakeable = exam.status === 'Pending';
                                    return (
                                        <TableRow key={`${exam.courseId}-${exam.id}`}>
                                            <TableCell className="font-medium">{exam.title}</TableCell>
                                            <TableCell>{exam.courseTitle}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {isUpcoming ? <Clock className="h-4 w-4 text-yellow-500" /> : <CheckCircle className="h-4 w-4 text-green-500"/>}
                                                    {format(examDate, 'PPP')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(exam.status)}>{exam.status}</Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {exam.status === 'Graded' ? `${exam.marksObtained}/${exam.totalMarks}` : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                {exam.status === 'Graded' || exam.status === 'Submitted' ? (
                                                    <>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/student/my-courses/${exam.courseId}/exams/${exam.id}`}><Eye className="mr-2 h-4 w-4"/>Results</Link>
                                                        </Button>
                                                        {exam.examType === 'MCQ' && (
                                                            <Button variant="secondary" size="sm" asChild>
                                                                <Link href={`/student/my-courses/${exam.courseId}/exams/${exam.id}/leaderboard`}><BarChart3 className="mr-2 h-4 w-4"/>Leaderboard</Link>
                                                            </Button>
                                                        )}
                                                    </>
                                                ) : isTakeable ? (
                                                    <Button size="sm" asChild>
                                                        <Link href={`/student/my-courses/${exam.courseId}/exams/${exam.id}`}><PlayCircle className="mr-2 h-4 w-4"/>Take Exam</Link>
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" disabled>N/A</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                            <ClipboardEdit className="w-12 h-12 mb-4 text-gray-400" />
                            <p>You have no exams scheduled in your enrolled courses.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
