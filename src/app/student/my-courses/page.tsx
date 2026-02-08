'use client';

import { useState, useEffect } from 'react';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { getCoursesByIds, getEnrollmentsByUserId, getOrganizations, getPrebookingsByUserId } from '@/lib/firebase/firestore';
import type { Course, Enrollment, Organization, Prebooking } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';

export default function MyCoursesPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<(Course & { progress: number; status: 'in-progress' | 'completed', lastViewed?: string; completedDate?: string })[]>([]);
  const [wishlistedCourses, setWishlistedCourses] = useState<Course[]>([]);
  const [prebookedCourses, setPrebookedCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!userInfo) {
      if (!authLoading) setLoading(false);
      return;
    }

    async function fetchCoursesData() {
      try {
        const [enrollmentsData, orgsData, prebookingsData] = await Promise.all([
          getEnrollmentsByUserId(userInfo!.uid),
          getOrganizations(),
          getPrebookingsByUserId(userInfo!.uid)
        ]);
        setOrganizations(orgsData);

        const enrolledCourseIds = enrollmentsData.map(e => e.courseId);
        const wishlistIds = userInfo.wishlist || [];
        const prebookedCourseIds = prebookingsData.map(p => p.courseId);
        
        const allNeededIds = [...new Set([...enrolledCourseIds, ...wishlistIds, ...prebookedCourseIds])];

        if (allNeededIds.length === 0) {
            setLoading(false);
            return;
        }
        
        const coursesData = await getCoursesByIds(allNeededIds);

        const studentEnrolledCourses = coursesData.filter(c => enrolledCourseIds.includes(c.id!));
        const coursesWithProgress = studentEnrolledCourses.map(course => {
            const enrollment = enrollmentsData.find(e => e.courseId === course.id);
            return {
                ...course,
                progress: enrollment?.progress || 0,
                status: enrollment?.status || 'in-progress',
                completedDate: enrollment?.status === 'completed' ? enrollment.enrollmentDate.toDate().toISOString().split('T')[0] : undefined,
            };
        });
        setEnrolledCourses(coursesWithProgress as any);

        const studentWishlistedCourses = coursesData.filter(c => wishlistIds.includes(c.id!));
        setWishlistedCourses(studentWishlistedCourses);

        const studentPrebookedCourses = coursesData.filter(c => prebookedCourseIds.includes(c.id!));
        setPrebookedCourses(studentPrebookedCourses);

      } catch (e) {
        console.error("Failed to fetch student courses", e);
        toast({ title: "Error", description: "Could not load your courses.", variant: 'destructive'});
      } finally {
        setLoading(false);
      }
    }
    fetchCoursesData();
  }, [userInfo, authLoading, toast]);
  
  const filterCourses = (courses: Course[]) => {
      return courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const inProgressCourses = filterCourses(enrolledCourses.filter(c => c.status === 'in-progress'));
  const completedCourses = filterCourses(enrolledCourses.filter(c => c.status === 'completed'));
  const filteredWishlistedCourses = filterCourses(wishlistedCourses);
  const filteredPrebookedCourses = filterCourses(prebookedCourses);

  if (loading || authLoading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Learning Library</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Continue your educational journey where you left off.
            </p>
          </div>
           <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search your courses..." className="pl-10 h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
        </div>
        
        <section>
            <h2 className="font-headline text-2xl font-bold mb-6 border-b pb-2">Ongoing Courses</h2>
            {inProgressCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {inProgressCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="in-progress" provider={provider} />
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">You don't have any courses in progress right now.</p>
                </div>
            )}
        </section>

        {filteredPrebookedCourses.length > 0 && (
            <section>
                <h2 className="font-headline text-2xl font-bold mb-6 border-b pb-2">Pre-booked Courses</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPrebookedCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="prebooked" provider={provider} />;
                    })}
                </div>
            </section>
        )}

        <section>
            <h2 className="font-headline text-2xl font-bold mb-6 border-b pb-2">Recently Completed</h2>
            {completedCourses.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {completedCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="completed" provider={provider} />
                    })}
                </div>
            ) : (
                 <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No completed courses yet. Keep pushing!</p>
                </div>
            )}
        </section>

        <section>
            <h2 className="font-headline text-2xl font-bold mb-6 border-b pb-2">My Wishlist</h2>
            {filteredWishlistedCourses.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredWishlistedCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="wishlisted" provider={provider} />;
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">Your wishlist is empty. See something you like? Click the heart icon!</p>
                </div>
            )}
        </section>
    </div>
  );
}
