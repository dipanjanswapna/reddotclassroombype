
import { FinancialsClient } from "./financials-client";
import { getEnrollments, getCourses, getUsers } from "@/lib/firebase/firestore";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Financials',
    description: 'Detailed financial reports, revenue charts, and transaction logs.',
};

export default async function FinancialsPage() {
  const [enrollmentsData, courses, users] = await Promise.all([
    getEnrollments(),
    getCourses(),
    getUsers()
  ]);

  // Serialize Timestamps to strings to pass to client component.
  const serializableEnrollments = enrollmentsData.map(e => ({
    ...e,
    enrollmentDate: e.enrollmentDate.toDate().toISOString(),
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Financials
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Detailed financial reports, revenue charts, and transaction logs.
            </p>
        </div>
        <FinancialsClient 
            initialEnrollments={serializableEnrollments as any}
            initialCourses={courses}
            initialUsers={users}
        />
    </div>
  );
}
