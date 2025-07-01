
'use client';

import { useState, useEffect } from 'react';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { getCourses, getUsers, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Course, User } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

// Mock current guardian
const currentGuardianId = 'usr_guar_003';

export default function GuardianCoursesPage() {
    const [guardian, setGuardian] = useState<User | null>(null);
    const [student, setStudent] = useState<User | null>(null);
    const [childsCourses, setChildsCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allUsers, allCourses] = await Promise.all([
                    getUsers(),
                    getCourses()
                ]);

                const currentGuardian = allUsers.find(u => u.id === currentGuardianId);
                const linkedStudent = currentGuardian ? allUsers.find(u => u.id === currentGuardian.linkedStudentId) : null;
                
                setGuardian(currentGuardian || null);
                setStudent(linkedStudent || null);

                if (linkedStudent && linkedStudent.id) {
                    const enrollments = await getEnrollmentsByUserId(linkedStudent.id);
                    const enrolledCourseIds = enrollments.map(e => e.courseId);
                    const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id!));
                    
                    const coursesWithProgress = enrolledCourses.map((course) => {
                        const enrollment = enrollments.find(e => e.courseId === course.id);
                        return {
                            ...course,
                            progress: enrollment?.progress || 0,
                        }
                    });
                    setChildsCourses(coursesWithProgress);
                }

            } catch (error) {
                console.error("Failed to fetch guardian data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
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
