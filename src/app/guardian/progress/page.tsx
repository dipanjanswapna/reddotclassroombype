
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle, Percent } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCourses } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Assignment } from '@/lib/types';
import { format, parseISO } from 'date-fns';

type GradedAssignment = Assignment & {
    courseName: string;
};

function getGradeColor(grade: string) {
    if (grade.startsWith('A')) return 'bg-green-500 text-white';
    if (grade.startsWith('B')) return 'bg-yellow-500 text-white';
    if (grade.startsWith('C')) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
}

const currentStudentId = 'usr_stud_001'; // Mock guardian's linked student

export default function GuardianProgressPage() {
  const [gradedAssignments, setGradedAssignments] = useState<GradedAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
        try {
            const allCourses = await getCourses();
            const assignments: GradedAssignment[] = [];
            allCourses.forEach(course => {
                if(course.assignments) {
                    course.assignments.forEach(assignment => {
                        if (assignment.status === 'Graded' && assignment.studentId === currentStudentId) {
                            assignments.push({
                                ...assignment,
                                courseName: course.title,
                            });
                        }
                    });
                }
            });
            setGradedAssignments(assignments.sort((a,b) => new Date(b.submissionDate as string).getTime() - new Date(a.submissionDate as string).getTime()));
        } catch (error) {
            console.error("Failed to fetch grades", error);
        } finally {
            setLoading(false);
        }
    }
    fetchGrades();
  }, []);

  if (loading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
              <LoadingSpinner className="w-12 h-12" />
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
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Across all enrolled courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">In all submitted assignments & quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Finished from start to end</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Grade Report</CardTitle>
            <CardDescription>Latest grades from assignments and quizzes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Assignment/Quiz</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradedAssignments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.courseName}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getGradeColor(item.grade || '')}>{item.grade}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.submissionDate && format(parseISO(item.submissionDate as string), 'PPP')}
                  </TableCell>
                </TableRow>
              ))}
              {gradedAssignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No graded assignments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
