
'use client';

import { useState, useEffect } from 'react';
import { getCourses } from '@/lib/firebase/firestore';
import type { Assignment } from '@/lib/types';
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
import { safeToDate } from '@/lib/utils';

type GradedAssignment = Assignment & {
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
  const { userInfo } = useAuth();
  const [gradedAssignments, setGradedAssignments] = useState<GradedAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      setLoading(false);
      return;
    }

    async function fetchGrades() {
        try {
            const allCourses = await getCourses();
            const assignments: GradedAssignment[] = [];

            allCourses.forEach(course => {
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
            });
            setGradedAssignments(assignments.sort((a,b) => safeToDate(b.submissionDate).getTime() - safeToDate(a.submissionDate).getTime()));
        } catch (error) {
            console.error("Failed to fetch grades", error);
        } finally {
            setLoading(false);
        }
    }
    fetchGrades();
  }, [userInfo]);


  if (loading) {
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
          View your grades and feedback from instructors for all your assignments and quizzes.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Grade Report</CardTitle>
            <CardDescription>Summary of your performance across all enrolled courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Assignment/Quiz</TableHead>
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
    </div>
  );
}
