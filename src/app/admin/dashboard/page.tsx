

import { getCourses, getUsers, getEnrollments } from '@/lib/firebase/firestore';
import { Course, User, Enrollment } from '@/lib/types';
import { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';
import { safeToDate } from '@/lib/utils';
import { StudyPlanEvent } from '@/ai/schemas/study-plan-schemas';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Platform-wide overview and management tools.',
};

// Serializable types for client components
export type SerializableUser = Omit<User, 'joined' | 'lastLoginAt' | 'lastCounseledAt' | 'studyPlan'> & { 
    joined: string, 
    lastLoginAt?: string,
    lastCounseledAt?: string,
    studyPlan?: StudyPlanEvent[],
};

export type SerializableEnrollment = Omit<Enrollment, 'enrollmentDate' | 'groupAccessedAt' | 'paymentDetails'> & { 
    enrollmentDate: string;
    groupAccessedAt?: string;
    paymentDetails?: {
        date: string;
    } & Omit<NonNullable<Enrollment['paymentDetails']>, 'date'>
};


export default async function AdminDashboardPage() {
  const [courses, usersData, enrollmentsData]: [Course[], User[], Enrollment[]] = await Promise.all([
    getCourses(),
    getUsers(),
    getEnrollments(),
  ]);

  // Serialize Timestamps to strings before passing to Client Component
  const users: SerializableUser[] = usersData.map(user => ({
    ...user,
    joined: safeToDate(user.joined).toISOString(),
    lastLoginAt: user.lastLoginAt ? safeToDate(user.lastLoginAt).toISOString() : undefined,
    lastCounseledAt: user.lastCounseledAt ? safeToDate(user.lastCounseledAt).toISOString() : undefined,
    studyPlan: user.studyPlan,
  }));

  const enrollments: SerializableEnrollment[] = enrollmentsData.map(enrollment => {
      const { enrollmentDate, groupAccessedAt, ...rest } = enrollment;

      return {
        ...rest,
        enrollmentDate: safeToDate(enrollmentDate).toISOString(),
        groupAccessedAt: groupAccessedAt ? safeToDate(groupAccessedAt).toISOString() : undefined,
      } as SerializableEnrollment;
  });


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
