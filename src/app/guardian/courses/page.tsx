
'use client';

import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { courses, mockUsers } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Child's Courses",
  description: "View all the courses your child is enrolled in at Red Dot Classroom.",
};

// Mock current guardian
const currentGuardianId = 'usr_guar_003';

export default function GuardianCoursesPage() {
    const guardian = mockUsers.find(u => u.id === currentGuardianId);
    const student = mockUsers.find(u => u.id === guardian?.linkedStudentId);

    // Get courses the linked student is enrolled in (mock logic)
    const childsCourses = student ? courses.filter(c => c.assignments?.some(a => a.studentId === student.id)).map((course, index) => ({
        ...course,
        progress: [70, 45, 90][index], // Still mock progress for simplicity
    })) : [];


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Your Child's Courses</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    An overview of all the courses your child, {student?.name || 'N/A'}, is currently enrolled in.
                </p>
            </div>
            
            <section>
                <h2 className="font-headline text-2xl font-bold mb-4">In Progress</h2>
                {childsCourses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {childsCourses.map((course) => (
                            <EnrolledCourseCard key={course.id} course={course} status="in-progress" />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-16 bg-muted rounded-lg">
                        <p className="text-muted-foreground">{student ? `${student.name} is not currently enrolled in any courses.` : 'No student linked to your account.'}</p>
                    </div>
                )}
            </section>
        </div>
    );
}
