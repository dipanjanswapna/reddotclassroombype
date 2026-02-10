
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Award, CheckCircle, Clock, PlayCircle, Eye, BarChart3, Calendar, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { Course, Exam } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format, isPast } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <LoadingSpinner className="w-10 h-10" />
            </div>
        );
    }

    if (!course) {
        return notFound();
    }

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2 border-l-4 border-primary pl-4"
      >
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Exam <span className="text-primary">Portal</span></h1>
        <p className="text-muted-foreground font-medium">Access schedules, participate in tests, and review results for {course.title}.</p>
      </motion.div>

      <Card className="rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
                <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Examination Schedule</CardTitle>
                <CardDescription className="font-medium text-xs">Stay synchronized with your upcoming assessments.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {exams.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="border-primary/10">
                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Exam Name</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Type</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Score</TableHead>
                    <TableHead className="text-right px-6 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {exams.map((exam) => {
                        const examDate = safeToDate(exam.examDate);
                        const isUpcoming = examDate > new Date();
                        const isTakeable = exam.status === 'Pending';

                        return (
                            <TableRow key={exam.id} className="border-primary/10 hover:bg-primary/5 transition-colors">
                                <TableCell className="px-6 py-5">
                                    <p className="font-black text-sm uppercase tracking-tight">{exam.title}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{exam.topic}</p>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-black text-[9px] uppercase tracking-tighter border-primary/10">{exam.examType}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                        <Calendar className={cn("w-3.5 h-3.5", isUpcoming ? "text-yellow-500" : "text-green-500")} />
                                        {format(examDate, 'dd MMM yyyy')}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(exam.status)} className="font-black text-[9px] uppercase tracking-widest px-3 py-1">
                                        {exam.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {exam.status === 'Graded' ? (
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-black text-sm text-primary">{exam.marksObtained}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground">/ {exam.totalMarks}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground italic uppercase">TBA</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-2">
                                        {exam.status === 'Graded' || exam.status === 'Submitted' ? (
                                            <>
                                            <Button variant="outline" size="sm" asChild className="rounded-xl h-9 font-black text-[9px] uppercase tracking-widest px-4 border-primary/10 hover:bg-primary/5">
                                                <Link href={`/student/my-courses/${courseId}/exams/${exam.id}`}>
                                                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Result
                                                </Link>
                                            </Button>
                                            <Button variant="secondary" size="sm" asChild className="rounded-xl h-9 font-black text-[9px] uppercase tracking-widest px-4">
                                                <Link href={`/student/my-courses/${courseId}/exams/${exam.id}/leaderboard`}>
                                                    <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Rank
                                                </Link>
                                            </Button>
                                            </>
                                        ) : isTakeable ? (
                                            <Button size="sm" asChild className="rounded-xl h-9 font-black text-[9px] uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
                                            <Link href={`/student/my-courses/${courseId}/exams/${exam.id}`}>
                                                <PlayCircle className="mr-1.5 h-3.5 w-3.5"/> Start Exam
                                            </Link>
                                            </Button>
                                        ) : (
                                            <Button size="sm" disabled className="rounded-xl h-9 font-black text-[9px] uppercase tracking-widest px-4">Locked</Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
                </Table>
            </div>
          ) : (
            <div className="text-center py-24 bg-muted/5 flex flex-col items-center">
                <Award className="w-12 h-12 text-primary/20 mb-4" />
                <p className="font-black uppercase tracking-widest text-xs opacity-40">No exams scheduled for this course</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
