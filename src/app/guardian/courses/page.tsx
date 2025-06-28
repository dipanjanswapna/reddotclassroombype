
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { courses } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Child's Courses",
  description: "View all the courses your child is enrolled in at Red Dot Classroom.",
};

export default function GuardianCoursesPage() {
    // Mocking the child's enrolled courses. In a real app, this would be fetched based on the guardian-student link.
    const childsCourses = courses.slice(0, 3).map((course, index) => ({
        ...course,
        progress: [70, 45, 90][index],
    }));

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Your Child's Courses</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    An overview of all the courses your child is currently enrolled in.
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
                        <p className="text-muted-foreground">Your child is not currently enrolled in any courses.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
