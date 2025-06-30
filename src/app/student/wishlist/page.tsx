

'use client';

import { Heart } from 'lucide-react';
import { getCourses, getUser } from '@/lib/firebase/firestore';
import { CourseCard } from '@/components/course-card';
import { useState, useEffect } from 'react';
import { Course, User } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

// Mock current student ID
const currentStudentId = 'usr_stud_001';

export default function WishlistPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wishlistedCourses, setWishlistedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const userData = await getUser(currentStudentId);
        setUser(userData);
        if (userData?.wishlist && userData.wishlist.length > 0) {
            const allCourses = await getCourses();
            const filtered = allCourses.filter(course => userData.wishlist!.includes(course.id!));
            setWishlistedCourses(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

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
            <CourseCard key={course.id} {...course} isWishlisted={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted rounded-lg">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Your wishlist is empty. Browse courses and save them for later!</p>
        </div>
      )}
    </div>
  );
}
