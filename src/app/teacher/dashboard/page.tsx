

'use client';

import { useState, useEffect } from 'react';
import {
  BookCopy,
  Users,
  MessageSquare,
  BarChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourses } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Course } from '@/lib/types';


// Mock teacher ID
const teacherId = 'ins-ja'; 

export default function TeacherDashboardPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentCount, setStudentCount] = useState(0);
    const [pendingGradingCount, setPendingGradingCount] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const allCourses = await getCourses();
                const teacherCourses = allCourses.filter(course => 
                    course.instructors?.some(instructor => instructor.id === teacherId)
                );
                setCourses(teacherCourses);

                const studentIds = new Set<string>();
                let pendingCount = 0;

                teacherCourses.forEach(course => {
                    (course.assignments || []).forEach(assignment => {
                        studentIds.add(assignment.studentId);
                        if (assignment.status === 'Submitted' || assignment.status === 'Late') {
                            pendingCount++;
                        }
                    });
                });

                setStudentCount(studentIds.size);
                setPendingGradingCount(pendingCount);

            } catch(e) {
                console.error("Failed to fetch dashboard data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

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
            <h1 className="font-headline text-4xl font-bold tracking-tight">
            Teacher Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Manage your courses, students, and content.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                My Courses
                </CardTitle>
                <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                Active courses
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{studentCount}</div>
                <p className="text-xs text-muted-foreground">
                Across all courses
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Pending Grading
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingGradingCount}</div>
                <p className="text-xs text-muted-foreground">
                Assignments to review
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Average Rating
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">
                From student reviews
                </p>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
