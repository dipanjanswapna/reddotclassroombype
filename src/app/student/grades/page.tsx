
'use client';

import { useState, useEffect } from 'react';
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Assignment, Exam } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from '@/components/loading-spinner';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { safeToDate } from '@/lib/utils';
import { Award, FileCheck2 } from 'lucide-react';

type GradedAssignment = Assignment & {
    courseName: string;
};

type GradedExam = Exam & {
    courseName: string;
};

function getGradeColor(grade: string | undefined) {
    if (!grade) return 'bg-gray-500 text-white';
    if (grade.startsWith('A')) return 'bg-green-500 text-white';
    if (grade.startsWith('B')) return 'bg-yellow-500 text-white';
    if (grade.startsWith('C')) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
}

export default function GradesPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [gradedAssignments, setGradedAssignments] = useState<GradedAssignment[]>([]);
  const [gradedExams, setGradedExams] = useState<GradedExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userInfo) {
        if (!authLoading) setLoading(false);
        return;
    };

    async function fetchGrades() {
        try {
            const enrollments = await getEnrollmentsByUserId(userInfo.uid);
            const enrolledCourseIds = enrollments.map(e => e.courseId);
            
            if (enrolledCourseIds.length === 0) {
                setLoading(false);
                return;
            }

            const allCourses = await getCourses();
            const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id!));
            
            const assignments: GradedAssignment[] = [];
            const exams: GradedExam[] = [];

            enrolledCourses.forEach(course => {
                if(course.assignments) {
                    course.assignments.forEach(assignment => {
                        if (assignment.status === 'Graded' && assignment.studentId === userInfo.uid) {
                            assignments.push({
                                ...assignment,
                                courseName: course.title,
                            });
                        }
                    });
                }
                if (course.exams) {
                    course.exams.forEach(exam => {
                        if (exam.status === 'Graded' && exam.studentId === userInfo.uid) {
                            exams.push({
                                ...exam,
                                courseName: course.title,
                            });
                        }
                    });
                }
            });

            setGradedAssignments(assignments.sort((a,b) => safeToDate(b.submissionDate).getTime() - safeToDate(a.submissionDate).getTime()));
            setGradedExams(exams.sort((a,b) => safeToDate(b.submissionDate).getTime() - safeToDate(a.submissionDate).getTime()));

        } catch (error) {
            console.error("Failed to fetch grades", error);
            toast({ title: 'Error', description: 'Could not fetch grade data.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }
    fetchGrades();
  }, [userInfo, authLoading, toast]);


  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Grades & Feedback</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          View your grades and feedback from instructors for all your assignments and exams.
        </p>
      </div>
      
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileCheck2 /> Assignment Grades</CardTitle>
                <CardDescription>Grades and feedback for your submitted assignments.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-right">Graded On</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {gradedAssignments.length > 0 ? gradedAssignments.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.courseName}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell className="text-center">
                        <Badge className={getGradeColor(item.grade)}>{item.grade || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {item.submissionDate ? format(safeToDate(item.submissionDate), 'PPP') : 'N/A'}
                    </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No graded assignments yet.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award /> Exam Results</CardTitle>
                <CardDescription>Results for your completed exams.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-right">Graded On</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {gradedExams.length > 0 ? gradedExams.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.courseName}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell className="text-center">
                            <Badge className={getGradeColor(item.grade)}>{item.marksObtained}/{item.totalMarks}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {item.submissionDate ? format(safeToDate(item.submissionDate), 'PPP') : 'N/A'}
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No graded exams yet.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
