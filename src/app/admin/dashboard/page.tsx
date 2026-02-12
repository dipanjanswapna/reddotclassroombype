
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
export type SerializableUser = Omit<User, 'joined' | 'lastLoginAt' | 'lastCounseledAt' | 'studyPlan' | 'activeSessions'> & { 
    joined: string, 
    lastLoginAt?: string,
    lastCounseledAt?: string,
    studyPlan?: StudyPlanEvent[],
    activeSessions?: {
        id: string;
        deviceName: string;
        ipAddress: string;
        lastLoginAt: string;
        userAgent: string;
    }[];
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
  const users: SerializableUser[] = usersData.map(user => {
    const { joined, lastLoginAt, lastCounseledAt, activeSessions, ...rest } = user;
    
    return {
        ...rest,
        joined: safeToDate(joined).toISOString(),
        lastLoginAt: lastLoginAt ? safeToDate(lastLoginAt).toISOString() : undefined,
        lastCounseledAt: lastCounseledAt ? safeToDate(lastCounseledAt).toISOString() : undefined,
        activeSessions: activeSessions?.map(session => ({
            ...session,
            lastLoginAt: safeToDate(session.lastLoginAt).toISOString()
        }))
    } as SerializableUser;
  });

  const enrollments: SerializableEnrollment[] = enrollmentsData.map(enrollment => {
      const { enrollmentDate, groupAccessedAt, ...rest } = enrollment;

      return {
        ...rest,
        enrollmentDate: safeToDate(enrollmentDate).toISOString(),
        groupAccessedAt: groupAccessedAt ? safeToDate(groupAccessedAt).toISOString() : undefined,
      } as SerializableEnrollment;
  });


  return (
    <div className="px-1 py-4 md:py-8 space-y-10">
        <div className="border-l-4 border-primary pl-4">
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
            System <span className="text-primary">Control</span>
            </h1>
            <p className="mt-2 text-sm md:text-lg text-muted-foreground font-medium">
            Platform-wide overview and management tools.
            </p>
        </div>
        <DashboardClient courses={courses} users={users} enrollments={enrollments} />
    </div>
  );
}
