
import {
  User,
  BookOpen,
  BarChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCourses, getEnrollmentsByUserId, getUsers } from '@/lib/firebase/firestore';
import type { User as UserType } from '@/lib/types';


// Mock current guardian
const currentGuardianId = 'usr_guar_003';

export default async function GuardianDashboardPage() {
    const allUsers = await getUsers();
    
    const currentGuardian = allUsers.find(u => u.id === currentGuardianId);
    const student = currentGuardian ? allUsers.find(u => u.id === currentGuardian.linkedStudentId) : null;
    
    let enrolledCoursesCount = 0;
    let overallProgress = 0;

    if (student && student.id) {
        const enrollments = await getEnrollmentsByUserId(student.id);
        enrolledCoursesCount = enrollments.length;
        if (enrollments.length > 0) {
            overallProgress = Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length);
        }
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
