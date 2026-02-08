import { getCourses, getUsers, getEnrollments } from '@/lib/firebase/firestore';
import { Course, User, Enrollment } from '@/lib/types';
import { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';
import { safeToDate } from '@/lib/utils';
import { StudyPlanEvent } from '@/ai/schemas/study-plan-schemas';

export const metadata: Metadata = {
    title: 'Admin Command Center',
    description: 'Platform-wide overview and management tools for RDC.',
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

/**
 * @fileOverview Refined Admin Dashboard.
 * Synchronized vertical spacing and elite typography for system administrators.
 */
export default async function AdminDashboardPage() {
  const [courses, usersData, enrollmentsData]: [Course[], User[], Enrollment[]] = await Promise.all([
    getCourses(),
    getUsers(),
    getEnrollments(),
  ]);

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
    <div className="space-y-10 md:space-y-14">
        <div className="text-center sm:text-left space-y-2">
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                System Command Center
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
                Platform-wide overview and mission-critical management tools.
            </p>
            <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
        </div>
        <DashboardClient courses={courses} users={users} enrollments={enrollments} />
    </div>
  );
}
