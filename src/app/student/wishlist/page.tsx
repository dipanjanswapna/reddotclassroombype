
import { Heart } from 'lucide-react';
import { courses } from '@/lib/mock-data';
import { CourseCard } from '@/components/course-card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'Your saved courses on Red Dot Classroom. Enroll when you are ready.',
};

const wishlistedCourses = courses.slice(5, 9);

export default function WishlistPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
         <div className="flex items-center gap-3 mb-2">
            <Heart className="w-10 h-10 text-destructive" />
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Wishlist</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Courses you've saved for later. Enroll when you're ready!
        </p>
      </div>

      {wishlistedCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlistedCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Your wishlist is empty. Browse courses and save them for later!</p>
        </div>
      )}
    </div>
  );
}
