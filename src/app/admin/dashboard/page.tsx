
import { getCourses, getUsers, getEnrollments } from '@/lib/firebase/firestore';
import { Course, User, Enrollment } from '@/lib/types';
import { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Platform-wide overview and management tools.',
};

export default async function AdminDashboardPage() {
  const [courses, users, enrollments]: [Course[], User[], Enrollment[]] = await Promise.all([
    getCourses(),
    getUsers(),
    getEnrollments(),
  ]);

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
