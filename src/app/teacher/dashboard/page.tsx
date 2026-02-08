'use client';

import { useState, useEffect } from 'react';
import {
  BookCopy,
  Users,
  MessageSquare,
  BarChart,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCourses, getInstructorByUid, getEnrollments, getBatches, getBranches } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Batch, Course } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { safeToDate } from '@/lib/utils';

type BatchWithDetails = Batch & {
    courseName: string;
    branchName: string;
}

/**
 * @fileOverview Polished Teacher Dashboard.
 * Elite visual hierarchy for course management and offline operations.
 */
export default function TeacherDashboardPage() {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    courseCount: 0,
    studentCount: 0,
    pendingGradingCount: 0,
    averageRating: 0,
  });
  const [assignedBatches, setAssignedBatches] = useState<BatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) return;

    const fetchDashboardData = async () => {
      try {
        const instructor = await getInstructorByUid(userInfo.uid);
        if (!instructor?.id) {
          toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        
        const [allCourses, allEnrollments, allBatches, allBranches] = await Promise.all([
          getCourses(),
          getEnrollments(),
          getBatches(),
          getBranches(),
        ]);
        
        const teacherCourses = allCourses.filter(course => 
          course.instructors?.some(i => i.slug === instructor.slug)
        );

        const teacherCourseIds = teacherCourses.map(c => c.id!);

        const studentIds = new Set<string>();
        allEnrollments.forEach(enrollment => {
          if (teacherCourseIds.includes(enrollment.courseId)) {
            studentIds.add(enrollment.userId);
          }
        });

        let pendingGradingCount = 0;
        let totalRating = 0;
        let ratedCourses = 0;

        teacherCourses.forEach(course => {
          (course.assignments || []).forEach(assignment => {
            if (assignment.status === 'Submitted' || assignment.status === 'Late') {
              pendingGradingCount++;
            }
          });
           (course.exams || []).forEach(exam => {
            const examDate = safeToDate(exam.examDate);
            const isPast = examDate <= new Date();
            const isOralOrPracticalPending = (exam.examType === 'Oral' || exam.examType === 'Practical') && exam.status === 'Pending' && isPast;
            const isWrittenSubmitted = (exam.examType === 'Written' || exam.examType === 'Essay' || exam.examType === 'Short Answer') && exam.status === 'Submitted';
            if(isOralOrPracticalPending || isWrittenSubmitted) {
                 pendingGradingCount++;
            }
          });
          if (course.rating && course.rating > 0) {
            totalRating += course.rating;
            ratedCourses++;
          }
        });

        const averageRating = ratedCourses > 0 ? (totalRating / ratedCourses) : 0;

        setStats({
          courseCount: teacherCourses.length,
          studentCount: studentIds.size,
          pendingGradingCount,
          averageRating: parseFloat(averageRating.toFixed(1)),
        });

        const teacherBatches = allBatches.filter(batch => batch.instructorSlugs.includes(instructor.slug));
        const batchesWithDetails = teacherBatches.map(batch => {
            const course = allCourses.find(c => c.id === batch.courseId);
            const branch = allBranches.find(b => b.id === batch.branchId);
            return {
                ...batch,
                courseName: course?.title || 'Unknown Course',
                branchName: branch?.name || 'Unknown Branch',
            }
        });
        setAssignedBatches(batchesWithDetails);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userInfo, toast]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-14">
        <div className="text-center sm:text-left space-y-2">
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                Academic Panel
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Manage your courses, learners, and classroom content.</p>
            <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glassmorphism-card border-primary/20 bg-primary/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Active Courses</CardTitle>
                    <BookCopy className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-primary tracking-tighter">{stats.courseCount}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Ongoing modules</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-blue-500/20 bg-blue-500/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Total Students</CardTitle>
                    <Users className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-blue-600 tracking-tighter">{stats.studentCount}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Active learners</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-orange-500/20 bg-orange-500/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-orange-600">Pending Grading</CardTitle>
                    <MessageSquare className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-orange-600 tracking-tighter">{stats.pendingGradingCount}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Awaiting review</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-accent/20 bg-accent/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-accent-foreground">Instructor Rating</CardTitle>
                    <BarChart className="h-5 w-5 text-accent-foreground group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-accent-foreground tracking-tighter">{stats.averageRating}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Based on student feedback</p>
                </CardContent>
            </Card>
        </div>

        <Card className="rounded-[2.5rem] border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
                <CardTitle className="font-black uppercase tracking-tight flex items-center gap-3">
                    <Building className="h-6 w-6 text-primary"/>
                    Assigned Offline Batches
                </CardTitle>
                <CardDescription className="font-medium">Direct face-to-face academic sessions in local centers.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Batch Name</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Course</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Branch</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Schedule</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-primary/5">
                            {assignedBatches.length > 0 ? assignedBatches.map(batch => (
                                <TableRow key={batch.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="px-8 py-6 font-bold">{batch.name}</TableCell>
                                    <TableCell className="px-8 py-6">{batch.courseName}</TableCell>
                                    <TableCell className="px-8 py-6">
                                        <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-widest rounded-lg">{batch.branchName}</Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {batch.schedule.map(s => (
                                                <Badge key={s.day} variant="outline" className="font-bold border-primary/20 text-[10px]">{s.day} @ {s.time}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium px-8">
                                        No assigned batches found.
                                    </TableCell>
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
