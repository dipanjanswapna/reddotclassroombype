'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getInstructorByUid, getCourses, getDoubts } from '@/lib/firebase/firestore';
import type { Course, Doubt } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye, HelpCircle } from 'lucide-react';
import Link from 'next/link';

type DoubtWithCourse = Doubt & {
  courseTitle: string;
};

/**
 * @fileOverview Polished Doubt Solver Dashboard.
 * Focused academic support metrics.
 */
export default function DoubtSolverDashboard() {
  const { userInfo, loading: authLoading } = useAuth();
  const [doubts, setDoubts] = useState<DoubtWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userInfo) return;

    const fetchData = async () => {
      try {
        const [allDoubts, allCourses] = await Promise.all([
          getDoubts(),
          getCourses(),
        ]);
        
        const coursesMap = new Map(allCourses.map(c => [c.id, c.title]));
        
        const assignedDoubts = allDoubts.filter(d => d.assignedDoubtSolverId === userInfo.uid || (d.status === 'Open' || d.status === 'Reopened'));
        
        const doubtsWithCourseInfo = assignedDoubts.map(d => ({
            ...d,
            courseTitle: coursesMap.get(d.courseId) || 'Unknown Course'
        }));
        
        setDoubts(doubtsWithCourseInfo.sort((a,b) => safeToDate(b.lastUpdatedAt).getTime() - safeToDate(a.lastUpdatedAt).getTime()));

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
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  const openDoubts = doubts.filter(d => d.status === 'Open' || d.status === 'Reopened');

  return (
    <div className="space-y-10 md:space-y-14">
        <div className="text-center sm:text-left space-y-2">
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                Expert Dashboard
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Welcome! Here are the questions that need your expertise.</p>
            <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glassmorphism-card border-primary/20 bg-primary/5 shadow-xl rounded-[2rem] overflow-hidden group bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Pending Doubts</CardTitle>
                    <HelpCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-primary tracking-tighter">{openDoubts.length}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Questions awaiting your reply</p>
                </CardContent>
            </Card>
        </div>

        <Card className="rounded-[2.5rem] border-primary/10 shadow-xl overflow-hidden bg-card">
            <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
                <CardTitle className="font-black uppercase tracking-tight flex items-center gap-3">
                    <HelpCircle className="h-6 w-6 text-primary"/>
                    Question Queue
                </CardTitle>
                <CardDescription className="font-medium">Active student queries across your assigned courses.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Course</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Question</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Last Update</TableHead>
                                <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-primary/5">
                            {openDoubts.map(doubt => (
                                <TableRow key={doubt.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="px-8 py-6 font-bold">{doubt.courseTitle}</TableCell>
                                    <TableCell className="px-8 py-6 max-w-xs truncate font-medium">{doubt.questionText || "Image Doubt"}</TableCell>
                                    <TableCell className="px-8 py-6">
                                        <Badge variant={doubt.status === 'Reopened' ? 'destructive' : 'default'} className="font-black text-[10px] uppercase tracking-widest rounded-lg">{doubt.status}</Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-muted-foreground text-xs font-bold">{formatDistanceToNow(safeToDate(doubt.lastUpdatedAt), { addSuffix: true })}</TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <Button asChild size="sm" className="font-black uppercase text-[10px] tracking-widest h-9 rounded-xl shadow-lg active:scale-95 transition-all">
                                            <Link href={`/doubt-solver/doubt/${doubt.id}`}><Eye className="mr-2 h-4 w-4"/> Resolve</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {openDoubts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">No pending doubts right now. Great job!</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
