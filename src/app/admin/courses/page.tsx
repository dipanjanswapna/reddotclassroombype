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
    <div className="px-1 py-4 md:py-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-l-4 border-primary pl-4">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase">
                    Course <span className="text-primary">Logistics</span>
                </h1>
                <p className="mt-2 text-sm md:text-lg text-muted-foreground font-medium">
                    Create, edit, and manage the entire academic catalog.
                </p>
            </div>
            <Button asChild className="rounded-xl font-black uppercase tracking-widest h-12 shadow-xl shadow-primary/20">
                <Link href="/admin/courses/builder/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
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