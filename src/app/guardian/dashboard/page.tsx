
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  BarChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCourses, getUsers } from '@/lib/firebase/firestore';
import type { Course, User as UserType } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';


// Mock current guardian
const currentGuardianId = 'usr_guar_003';

export default function GuardianDashboardPage() {
    const [guardian, setGuardian] = useState<UserType | null>(null);
    const [student, setStudent] = useState<UserType | null>(null);
    const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // This would be calculated from real data in a full app
    const overallProgress = 75;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allUsers, allCourses] = await Promise.all([
                    getUsers(),
                    getCourses()
                ]);

                const currentGuardian = allUsers.find(u => u.id === currentGuardianId);
                const linkedStudent = currentGuardian ? allUsers.find(u => u.id === currentGuardian.linkedStudentId) : null;
                
                setGuardian(currentGuardian || null);
                setStudent(linkedStudent || null);

                if (linkedStudent) {
                    const enrolledCourses = allCourses.filter(c => 
                        c.assignments?.some(a => a.studentId === linkedStudent.id)
                    );
                    setEnrolledCoursesCount(enrolledCourses.length);
                }

            } catch (error) {
                console.error("Failed to fetch guardian data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
  
    if (!student) {
      return (
          <div className="p-4 sm:p-6 lg:p-8">
             <h1 className="font-headline text-4xl font-bold tracking-tight">Guardian Dashboard</h1>
             <p className="mt-4 text-muted-foreground">No student is currently linked to your account. Please ask your child to send an invitation from their portal.</p>
          </div>
      );
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          Guardian Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Monitor your child's academic progress.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Student
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.name}</div>
            <p className="text-xs text-muted-foreground">{student.className || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Courses Enrolled
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCoursesCount}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
