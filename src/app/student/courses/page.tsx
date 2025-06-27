
import { CourseCard } from '@/components/course-card';
import { courses } from '@/lib/mock-data';

export default function MyCoursesPage() {
  // Mocking 5 enrolled courses for demonstration
  const enrolledCourses = courses.slice(0, 5); 

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            All your enrolled courses in one place. Keep learning!
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
    </div>
  );
}
