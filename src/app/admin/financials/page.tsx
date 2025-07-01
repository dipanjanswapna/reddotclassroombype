import { FinancialsClient } from "./financials-client";
import { getEnrollments, getCourses, getUsers } from "@/lib/firebase/firestore";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Financials',
    description: 'Detailed financial reports, revenue charts, and transaction logs.',
};

export default async function FinancialsPage() {
  const [enrollments, courses, users] = await Promise.all([
    getEnrollments(),
    getCourses(),
    getUsers()
  ]);

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
            initialEnrollments={enrollments}
            initialCourses={courses}
            initialUsers={users}
        />
    </div>
  );
}
