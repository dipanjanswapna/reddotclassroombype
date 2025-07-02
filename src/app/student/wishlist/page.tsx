
'use client';

import { Heart } from 'lucide-react';
import { getCourses, getOrganizations } from '@/lib/firebase/firestore';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { useState, useEffect } from 'react';
import { Course, Organization } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';

export default function WishlistPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const [wishlistedCourses, setWishlistedCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function fetchWishlist() {
      if (userInfo?.wishlist && userInfo.wishlist.length > 0) {
        try {
          const [allCourses, allOrgs] = await Promise.all([
            getCourses(),
            getOrganizations()
          ]);
          const filtered = allCourses.filter(course => userInfo.wishlist!.includes(course.id!));
          setWishlistedCourses(filtered);
          setOrganizations(allOrgs);
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
        }
      } else {
          setWishlistedCourses([]);
      }
      setLoading(false);
    }
    fetchWishlist();
  }, [userInfo, authLoading]);

  if (loading || authLoading) {
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
          {wishlistedCourses.map((course) => {
            const provider = organizations.find(p => p.id === course.organizationId);
            return <EnrolledCourseCard key={course.id} course={course} status="wishlisted" provider={provider} />;
          })}
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
