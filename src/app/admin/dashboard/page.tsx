
import { getCourses, getUsers, getEnrollments } from '@/lib/firebase/firestore';
import { Course, User, Enrollment } from '@/lib/types';
import { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';
import { safeToDate } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Platform-wide overview and management tools.',
};

export default async function AdminDashboardPage() {
  const [courses, usersData, enrollmentsData]: [Course[], User[], Enrollment[]] = await Promise.all([
    getCourses(),
    getUsers(),
    getEnrollments(),
  ]);

  // Serialize Timestamps to strings before passing to Client Component
  const users = usersData.map(user => ({
    ...user,
    joined: safeToDate(user.joined).toISOString(),
  }));

  const enrollments = enrollmentsData.map(enrollment => ({
    ...enrollment,
    enrollmentDate: safeToDate(enrollment.enrollmentDate).toISOString(),
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight">
            Admin Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Platform-wide overview and management tools.
            </p>
        </div>
        <DashboardClient courses={courses} users={users} enrollments={enrollments} />
    </div>
  );
}
