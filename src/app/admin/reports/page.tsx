
import { getCourses, getUsers, getEnrollments } from '@/lib/firebase/firestore';
import { Course, User, Enrollment } from '@/lib/types';
import { Metadata } from 'next';
import { ReportsClient } from './reports-client';


export const metadata: Metadata = {
    title: 'Platform Reports',
    description: 'Detailed visual reports on user growth, course enrollments, and more.',
};

export default async function ReportsPage() {
    const [courses, users, enrollments]: [Course[], User[], Enrollment[]] = await Promise.all([
        getCourses(),
        getUsers(),
        getEnrollments(),
    ]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tight">
                Platform Reports
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                In-depth analysis of platform performance and trends.
                </p>
            </div>
            
            <ReportsClient courses={courses} users={users} enrollments={enrollments} />

        </div>
    );
}
