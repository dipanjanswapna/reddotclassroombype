

'use client';

import { useState, useEffect } from 'react';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { getCourses, getUser } from '@/lib/firebase/firestore';
import type { Course, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ListFilter } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';

// Mock current student ID
const currentStudentId = 'usr_stud_001';

export default function MyCoursesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [wishlistedCourses, setWishlistedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      async function fetchCoursesData() {
          try {
              const [userData, allCourses] = await Promise.all([
                getUser(currentStudentId),
                getCourses()
              ]);
              setUser(userData);

              // Determine enrolled courses based on assignment data (mock logic)
              const studentEnrolledCourses = allCourses.filter(c => c.assignments?.some(a => a.studentId === currentStudentId));
              setEnrolledCourses(studentEnrolledCourses);

              // Fetch wishlist courses
              if (userData?.wishlist && userData.wishlist.length > 0) {
                const studentWishlistedCourses = allCourses.filter(c => userData.wishlist!.includes(c.id!));
                setWishlistedCourses(studentWishlistedCourses);
              }

          } catch(e) {
              console.error("Failed to fetch courses", e);
          } finally {
              setLoading(false);
          }
      }
      fetchCoursesData();
  }, []);

  // For demo, we'll divide enrolled courses into "in-progress" and "completed"
  const inProgressCourses = enrolledCourses.slice(0, 3).map((course, index) => ({
    ...course,
    progress: [70, 45, 90, 25][index % 4],
    lastViewed: ['Today', '2 days ago', 'Yesterday', '1 week ago'][index % 4],
  }));

  const completedCourses = enrolledCourses.length > 3 ? enrolledCourses.slice(3, 5).map((course, index) => ({
      ...course,
      progress: 100,
      completedDate: ['2024-05-15', '2024-06-01'][index % 2],
  })) : [];

  if (loading) {
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
            <h1 className="font-headline text-3xl font-bold tracking-tight">স্বাগতম, {user?.name || 'Student'}!</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              আপনার শেখার যাত্রা চালিয়ে যান।
            </p>
          </div>
           <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="আপনার কোর্স খুঁজুন..." className="pl-9" />
              </div>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" />
                ফিল্টার
              </Button>
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
