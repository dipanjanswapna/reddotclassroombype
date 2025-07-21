

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCourses } from '@/lib/firebase/firestore';
import { AdminCoursesClient } from '@/components/admin/courses-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';


async function AdminCoursesContent() {
    const courses = await getCourses();
    return <AdminCoursesClient initialCourses={courses} />;
}

export default function AdminCourseManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Course Management
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Create, edit, and manage all courses on the platform.
                </p>
            </div>
            <Button asChild>
                <Link href="/admin/courses/builder/new">
                    <PlusCircle className="mr-2" />
                    Create New Course
                </Link>
            </Button>
        </div>
        <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}>
            <AdminCoursesContent />
        </Suspense>
    </div>
  );
}
