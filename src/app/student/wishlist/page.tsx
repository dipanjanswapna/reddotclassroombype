
'use client';

import { useState, useEffect } from 'react';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { getCoursesByIds, getOrganizations } from '@/lib/firebase/firestore';
import type { Course, Organization } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Heart } from 'lucide-react';

export default function StudentWishlistPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [wishlistedCourses, setWishlistedCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      if (!authLoading) setLoading(false);
      return;
    }

    async function fetchWishlistData() {
      try {
        const wishlistIds = userInfo.wishlist || [];
        if (wishlistIds.length === 0) {
          setLoading(false);
          return;
        }
        
        const [coursesData, orgsData] = await Promise.all([
            getCoursesByIds(wishlistIds),
            getOrganizations()
        ]);
        
        setWishlistedCourses(coursesData);
        setOrganizations(orgsData);

      } catch (e) {
        console.error("Failed to fetch wishlist", e);
        toast({ title: "Error", description: "Could not load your wishlist.", variant: 'destructive'});
      } finally {
        setLoading(false);
      }
    }
    fetchWishlistData();
  }, [userInfo, authLoading, toast]);


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
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Wishlist</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Courses you've saved for later.
            </p>
        </div>
        
        <section>
            {wishlistedCourses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlistedCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="wishlisted" provider={provider} />
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-muted rounded-lg">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your wishlist is empty.</p>
                    <p className="text-sm text-muted-foreground mt-2">Browse courses and click the heart icon to save them for later.</p>
                </div>
            )}
        </section>
    </div>
  );
}
