
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">স্বাগতম, {userInfo?.name || 'Student'}!</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              আপনার শেখার যাত্রা চালিয়ে যান।
            </p>
          </div>
           <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="আপনার কোর্স খুঁজুন..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
        </div>
        
        <section>
            <h2 className="font-headline text-2xl font-bold mb-4">চলমান কোর্সসমূহ</h2>
            {inProgressCourses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {inProgressCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="in-progress" provider={provider} />
                    })}
                </div>
            ) : (
                <p className="text-muted-foreground">You have no courses in progress.</p>
            )}
        </section>

        {filteredPrebookedCourses.length > 0 && (
            <section>
                <h2 className="font-headline text-2xl font-bold mb-4">প্রি-বুক করা কোর্স</h2>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPrebookedCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="prebooked" provider={provider} />;
                    })}
                </div>
            </section>
        )}

        <section>
            <h2 className="font-headline text-2xl font-bold mb-4">সম্প্রতি সম্পন্ন কোর্সসমূহ</h2>
            {completedCourses.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {completedCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="completed" provider={provider} />
                    })}
                </div>
            ) : (
                 <p className="text-muted-foreground">You have not completed any courses yet.</p>
            )}
        </section>

        <section>
            <h2 className="font-headline text-2xl font-bold mb-4">উইশলিস্টে থাকা কোর্স</h2>
            {filteredWishlistedCourses.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWishlistedCourses.map((course) => {
                        const provider = organizations.find(p => p.id === course.organizationId);
                        return <EnrolledCourseCard key={course.id} course={course} status="wishlisted" provider={provider} />;
                    })}
                </div>
            ) : (
                <p className="text-muted-foreground">Your wishlist is empty.</p>
            )}
        </section>
    </div>
  );
}
