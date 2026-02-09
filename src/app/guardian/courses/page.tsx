
'use client';

import { useState, useEffect } from 'react';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { getCourses, getUsers, getEnrollmentsByUserId, getUser, getOrganizations } from '@/lib/firebase/firestore';
import type { Course, User, Enrollment, Organization } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';

export default function GuardianCoursesPage() {
    const { userInfo: guardian, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [student, setStudent] = useState<User | null>(null);
    const [childsCourses, setChildsCourses] = useState<Course[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        
        const fetchData = async () => {
            if (!guardian || !guardian.linkedStudentId) {
                setLoading(false);
                return;
            }
            try {
                const [linkedStudent, allCourses, enrollments, orgsData] = await Promise.all([
                    getUser(guardian.linkedStudentId),
                    getCourses(),
                    getEnrollmentsByUserId(guardian.linkedStudentId),
                    getOrganizations()
                ]);
                
                setStudent(linkedStudent || null);
                setOrganizations(orgsData);

                if (linkedStudent) {
                    const enrolledCourseIds = enrollments.map(e => e.courseId);
                    const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id!));
                    
                    const coursesWithProgress = enrolledCourses.map((course) => {
                        const enrollment = enrollments.find(e => e.courseId === course.id);
                        return {
                            ...course,
                            progress: enrollment?.progress || 0,
                            status: enrollment?.status || 'in-progress'
                        }
                    });
                    setChildsCourses(coursesWithProgress);
                }

            } catch (error) {
                console.error("Failed to fetch guardian data:", error);
                toast({ title: "Error", description: "Failed to fetch course data for your child.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authLoading, guardian, toast]);

    if (loading || authLoading) {
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
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0 md:gap-y-8">
                        {childsCourses.filter(c => (c as any).status === 'in-progress').map((course) => {
                            const provider = organizations.find(p => p.id === course.organizationId);
                            return <EnrolledCourseCard key={course.id} course={course} status="in-progress" provider={provider} />
                        })}
                    </div>
                ) : (
                     <div className="text-center py-16 bg-muted rounded-lg">
                        <p className="text-muted-foreground">{student ? `${student.name} is not currently enrolled in any courses.` : 'No student linked to your account.'}</p>
                    </div>
                )}
            </section>
             <section>
                <h2 className="font-headline text-2xl font-bold mb-4">Completed</h2>
                {childsCourses.length > 0 && childsCourses.some(c => (c as any).status === 'completed') ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0 md:gap-y-8">
                        {childsCourses.filter(c => (c as any).status === 'completed').map((course) => {
                            const provider = organizations.find(p => p.id === course.organizationId);
                            return <EnrolledCourseCard key={course.id} course={course} status="completed" provider={provider} />
                        })}
                    </div>
                ) : (
                     <div className="text-center py-8 bg-muted rounded-lg">
                        <p className="text-muted-foreground">{student ? `${student.name} has not completed any courses yet.` : 'No student linked to your account.'}</p>
                    </div>
                )}
            </section>
        </div>
    );
}
