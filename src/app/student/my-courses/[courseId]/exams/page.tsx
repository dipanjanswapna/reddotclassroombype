
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Award, CheckCircle, Clock, PlayCircle, Eye, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { Course, Exam } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format, isPast } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const getStatusBadgeVariant = (status: Exam['status']): VariantProps<typeof badgeVariants>['variant'] => {
  switch (status) {
    case 'Graded':
      return 'accent';
    case 'Submitted':
        return 'warning';
    case 'Pending':
    default:
      return 'secondary';
  }
};

export default function ExamsPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const { userInfo, loading: authLoading } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        
        async function fetchExams() {
            if (!userInfo) {
                setLoading(false);
                return;
            }
            try {
                const courseData = await getCourse(courseId);
                if (courseData) {
                    setCourse(courseData);
                    const studentExams = (courseData.exams || []).filter(e => e.studentId === userInfo.uid);
                    studentExams.sort((a,b) => safeToDate(a.examDate).getTime() - safeToDate(b.examDate).getTime());
                    setExams(studentExams);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch exam data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchExams();
    }, [courseId, userInfo, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    if (!course) {
        return notFound();
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Exams</h1>
        <p className="mt-1 text-lg text-muted-foreground">View your exam schedule and results for {course.title}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Exams</CardTitle>
          <CardDescription>Stay on top of your exam schedule and check your performance.</CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Type</TableHead>
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
                        <TableRow key={exam.id}>
                            <TableCell className="font-medium">{exam.title}</TableCell>
                            <TableCell><Badge variant="outline">{exam.examType}</Badge></TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {isUpcoming ? <Clock className="h-4 w-4 text-yellow-500" /> : <CheckCircle className="h-4 w-4 text-green-500"/>}
                                    {format(examDate, 'PPP')}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(exam.status)}>
                                    {exam.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                                {exam.status === 'Graded' ? `${exam.marksObtained} / ${exam.totalMarks}` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                              {exam.status === 'Graded' || exam.status === 'Submitted' ? (
                                <>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/student/my-courses/${courseId}/exams/${exam.id}`}><Eye className="mr-2 h-4 w-4"/>Results</Link>
                                  </Button>
                                   <Button variant="secondary" size="sm" asChild>
                                    <Link href={`/student/my-courses/${courseId}/exams/${exam.id}/leaderboard`}><BarChart3 className="mr-2 h-4 w-4"/>Leaderboard</Link>
                                  </Button>
                                </>
                              ) : isTakeable ? (
                                <Button size="sm" asChild>
                                  <Link href={`/student/my-courses/${courseId}/exams/${exam.id}`}><PlayCircle className="mr-2 h-4 w-4"/>Take Exam</Link>
                                </Button>
                              ) : (
                                <Button size="sm" disabled>N/A</Button>
                              )}
                            </TableCell>
                        </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 bg-muted rounded-lg">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No exams are scheduled for this course yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
