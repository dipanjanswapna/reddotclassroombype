
'use client';

import { useState, useEffect } from 'react';
import {
  BookCopy,
  Users,
  MessageSquare,
  BarChart,
  Building,
  Star,
  Award,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCourses, getInstructorByUid, getEnrollments, getBatches, getBranches } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Batch, Branch, Course } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { safeToDate } from '@/lib/utils';
import { motion } from 'framer-motion';

type BatchWithDetails = Batch & {
    courseName: string;
    branchName: string;
}

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
            const isWrittenSubmitted = (exam.examType === 'Written' || exam.examType === 'Essay' || exam.examType === 'Short Answer') && exam.status === 'Submitted';
            if(isWrittenSubmitted) {
                 pendingGradingCount++;
            }
          });
          if (course.rating && course.rating > 0) {
            totalRating += course.rating;
            ratedCourses++;
          }
        });

        setStats({
          courseCount: teacherCourses.length,
          studentCount: studentIds.size,
          pendingGradingCount,
          averageRating: ratedCourses > 0 ? parseFloat((totalRating / ratedCourses).toFixed(1)) : 0,
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
    <div className="px-1 py-4 md:py-8 space-y-10">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border-l-4 border-accent pl-4"
        >
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
            Academic <span className="text-accent">Panel</span>
            </h1>
            <p className="mt-2 text-sm md:text-lg text-muted-foreground font-medium">
            Manage your courses, students, and grading tasks.
            </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Active Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">{stats.courseCount}</div>
                    <BookCopy className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">{stats.studentCount}</div>
                    <Users className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Pending Grading</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">{stats.pendingGradingCount}</div>
                    <MessageSquare className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Avg. Rating</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black flex items-center gap-2">
                        {stats.averageRating} <Star className="h-5 w-5 fill-current" />
                    </div>
                    <TrendingUp className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>
        </div>

        <Card className="rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
            <CardHeader className="bg-accent/5 p-5 border-b border-black/5">
                <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-accent"/>
                    <CardTitle className="text-sm font-black uppercase tracking-tight">My Offline Batches</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-black/5">
                            <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Batch Name</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Course</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Branch</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-right px-6">Schedule</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignedBatches.length > 0 ? assignedBatches.map(batch => (
                            <TableRow key={batch.id} className="border-black/5 hover:bg-muted/20 transition-colors">
                                <TableCell className="px-6 py-4">
                                    <div className="font-bold text-sm uppercase tracking-tight">{batch.name}</div>
                                </TableCell>
                                <TableCell className="text-[10px] font-bold text-muted-foreground">{batch.courseName}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-accent/20 text-accent">
                                        {batch.branchName}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right px-6 py-4">
                                    <div className="flex flex-col gap-1 items-end">
                                        {batch.schedule.map((s, i) => (
                                            <Badge key={i} variant="secondary" className="text-[8px] h-4.5 font-bold whitespace-nowrap">
                                                {s.day}, {s.time}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-30">
                                        <Building className="w-12 h-12 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No assigned batches found</p>
                                    </div>
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
