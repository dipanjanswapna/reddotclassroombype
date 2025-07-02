
'use client';

import { useState, useEffect } from 'react';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { getCourses, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import type { Course, User, Enrollment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ListFilter } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Courses',
    description: 'Your learning journey starts here. Access all your enrolled courses.',
};


export default function MyCoursesPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!userInfo) {
      if (!authLoading) setLoading(false);
      return;
    };

    async function fetchCoursesData() {
        try {
            const [coursesData, enrollmentsData] = await Promise.all([
            getCourses(),
            getEnrollmentsByUserId(userInfo.uid)
            ]);
            setAllCourses(coursesData);
            setEnrollments(enrollmentsData);
        } catch(e) {
            console.error("Failed to fetch courses", e);
        } finally {
            setLoading(false);
        }
    }
    fetchCoursesData();
  }, [userInfo, authLoading]);

  const getCourseById = (courseId: string) => allCourses.find(c => c.id === courseId);
  
  const filterCourses = (courses: (Course & { progress?: number; lastViewed?: string; completedDate?: string })[]) => {
      return courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const inProgressCourses = filterCourses(enrollments
    .filter(e => e.status === 'in-progress')
    .map(e => {
        const course = getCourseById(e.courseId);
        return course ? { ...course, progress: e.progress, lastViewed: 'Today' } : null; // lastViewed is mock
    })
    .filter(Boolean) as (Course & { progress: number; lastViewed: string })[]);

  const completedCourses = filterCourses(enrollments
    .filter(e => e.status === 'completed')
    .map(e => {
        const course = getCourseById(e.courseId);
        return course ? { ...course, completedDate: e.enrollmentDate.toDate().toISOString().split('T')[0] } : null;
    })
    .filter(Boolean) as (Course & { completedDate: string })[]);


  const wishlistedCourses = userInfo?.wishlist 
    ? filterCourses(allCourses.filter(c => userInfo.wishlist!.includes(c.id!)))
    : [];

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
                    {inProgressCourses.map((course) => (
                        <EnrolledCourseCard key={course.id} course={course} status="in-progress" />
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">You have no courses in progress.</p>
            )}
        </section>

        <section>
            <h2 className="font-headline text-2xl font-bold mb-4">সম্প্রতি সম্পন্ন কোর্সসমূহ</h2>
            {completedCourses.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {completedCourses.map((course) => (
                        <EnrolledCourseCard key={course.id} course={course} status="completed" />
                    ))}
                </div>
            ) : (
                 <p className="text-muted-foreground">You have not completed any courses yet.</p>
            )}
        </section>

        <section>
            <h2 className="font-headline text-2xl font-bold mb-4">উইশলিস্টে থাকা কোর্স</h2>
            {wishlistedCourses.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {wishlistedCourses.map((course) => (
                        <EnrolledCourseCard key={course.id} course={course} status="wishlisted" />
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">Your wishlist is empty.</p>
            )}
        </section>
    </div>
  );
}
