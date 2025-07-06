

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle, Percent, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Assignment, Course, Enrollment, Exam } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { safeToDate } from '@/lib/utils';

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


export default function GuardianProgressPage() {
  const { userInfo: guardian, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [gradedAssignments, setGradedAssignments] = useState<GradedAssignment[]>([]);
  const [gradedExams, setGradedExams] = useState<GradedExam[]>([]);
  const [stats, setStats] = useState({
      overallCompletion: 0,
      averageScore: 0,
      completedCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(authLoading) return;
    async function fetchGrades() {
        if (!guardian || !guardian.linkedStudentId) {
            setLoading(false);
            return;
        }

        try {
            const [allCourses, enrollments] = await Promise.all([
                getCourses(),
                getEnrollmentsByUserId(guardian.linkedStudentId!)
            ]);

            const enrolledCourseIds = enrollments.map(e => e.courseId);
            const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id!));
            
            const assignments: GradedAssignment[] = [];
            const exams: GradedExam[] = [];
            let totalScore = 0;
            let gradedCount = 0;

            enrolledCourses.forEach(course => {
                if(course.assignments) {
                    course.assignments.forEach(assignment => {
                        if (assignment.status === 'Graded' && assignment.studentId === guardian.linkedStudentId) {
                            assignments.push({
                                ...assignment,
                                courseName: course.title,
                            });
                            if (assignment.grade?.includes('A')) totalScore += 95;
                            else if (assignment.grade?.includes('B')) totalScore += 85;
                            else if (assignment.grade?.includes('C')) totalScore += 75;
                            else if (assignment.grade?.includes('D')) totalScore += 65;
                            else totalScore += 50;
                            gradedCount++;
                        }
                    });
                }
                if(course.exams) {
                    course.exams.forEach(exam => {
                        if (exam.status === 'Graded' && exam.studentId === guardian.linkedStudentId) {
                            exams.push({
                                ...exam,
                                courseName: course.title,
                            });
                            if(exam.marksObtained && exam.totalMarks > 0) {
                                totalScore += (exam.marksObtained / exam.totalMarks) * 100;
                                gradedCount++;
                            }
                        }
                    });
                }
            });
            setGradedAssignments(assignments.sort((a,b) => safeToDate(b.submissionDate).getTime() - safeToDate(a.submissionDate).getTime()));
            setGradedExams(exams.sort((a,b) => safeToDate(b.examDate).getTime() - safeToDate(a.examDate).getTime()));

            const overallCompletion = enrollments.length > 0 
                ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length) 
                : 0;
            
            const averageScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;
            const completedCourses = enrollments.filter(e => e.status === 'completed').length;
            
            setStats({ overallCompletion, averageScore, completedCourses });

        } catch (error) {
            console.error("Failed to fetch grades", error);
            toast({ title: 'Error', description: 'Could not fetch progress data.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }
    fetchGrades();
  }, [authLoading, guardian, toast]);

  if (loading || authLoading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
              <LoadingSpinner className="w-12 h-12" />
          </div>
      );
  }

  if (!guardian?.linkedStudentId) {
    return (
        <div className="p-8 text-center">
            <h1 className="font-headline text-2xl font-bold">No Student Linked</h1>
            <p className="text-muted-foreground mt-2">Please ask your child to invite you from their Guardian page.</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Child's Progress Report</h1>
        <p className="mt-1 text-lg text-muted-foreground">A detailed overview of your child's academic performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallCompletion}%</div>
            <p className="text-xs text-muted-foreground">Across all enrolled courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">In all submitted assignments & quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Finished from start to end</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Recent Assignment Grades</CardTitle>
                <CardDescription>Latest grades from assignments.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {gradedAssignments.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.courseName}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell className="text-center">
                        <Badge className={getGradeColor(item.grade)}>{item.grade}</Badge>
                    </TableCell>
                    </TableRow>
                ))}
                {gradedAssignments.length === 0 && (
                    <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No graded assignments found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Recent Exam Results</CardTitle>
                <CardDescription>Latest results from exams.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {gradedExams.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.courseName}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell className="text-center">
                        <Badge className={getGradeColor(item.grade)}>{item.marksObtained}/{item.totalMarks}</Badge>
                    </TableCell>
                    </TableRow>
                ))}
                {gradedExams.length === 0 && (
                    <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No graded exams found.
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
