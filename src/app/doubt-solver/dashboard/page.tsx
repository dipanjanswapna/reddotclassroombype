'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getInstructorByUid, getCourses, getDoubtsByCourse } from '@/lib/firebase/firestore';
import type { Course, Doubt } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';

type DoubtWithCourse = Doubt & {
  courseTitle: string;
};

export default function DoubtSolverDashboard() {
  const { userInfo, loading: authLoading } = useAuth();
  const [doubts, setDoubts] = useState<DoubtWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userInfo) return;

    const fetchData = async () => {
      try {
        const doubtSolver = await getInstructorByUid(userInfo.uid);
        if (!doubtSolver?.assignedCourses || doubtSolver.assignedCourses.length === 0) {
          setLoading(false);
          return;
        }

        const coursesData = await getCourses();
        const assignedCourses = coursesData.filter(c => doubtSolver.assignedCourses?.includes(c.id!));
        
        const allDoubts: DoubtWithCourse[] = [];
        for (const course of assignedCourses) {
          const courseDoubts = await getDoubtsByCourse(course.id!);
          const doubtsWithCourseInfo = courseDoubts.map(d => ({ ...d, courseTitle: course.title }));
          allDoubts.push(...doubtsWithCourseInfo);
        }
        
        setDoubts(allDoubts.sort((a,b) => safeToDate(b.lastUpdatedAt).getTime() - safeToDate(a.lastUpdatedAt).getTime()));

      } catch (error) {
        console.error("Error fetching doubts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const openDoubts = doubts.filter(d => d.status === 'Open' || d.status === 'Reopened');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Doubt Solver Dashboard</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Welcome! Here are the questions that need your expertise.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New & Re-opened Doubts ({openDoubts.length})</CardTitle>
          <CardDescription>Questions that are waiting for your answer.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Update</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {openDoubts.map(doubt => (
                         <TableRow key={doubt.id}>
                            <TableCell>{doubt.courseTitle}</TableCell>
                            <TableCell className="max-w-xs truncate">{doubt.questionText}</TableCell>
                            <TableCell><Badge variant={doubt.status === 'Reopened' ? 'destructive' : 'default'}>{doubt.status}</Badge></TableCell>
                            <TableCell>{formatDistanceToNow(safeToDate(doubt.lastUpdatedAt), { addSuffix: true })}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild size="sm">
                                    <Link href={`/doubt-solver/doubt/${doubt.id}`}><Eye className="mr-2 h-4 w-4"/> View & Answer</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {openDoubts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No pending doubts right now. Great job!</TableCell>
                        </TableRow>
                    )}
                </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}
