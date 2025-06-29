
'use client';

import { useState, useEffect } from 'react';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { getCourses } from '@/lib/firebase/firestore';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ListFilter } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function MyCoursesPage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      async function fetchCoursesData() {
          try {
              // In a real app, you would fetch courses the user is actually enrolled in.
              // For now, we'll fetch all and categorize them based on mock logic.
              const courses = await getCourses();
              setAllCourses(courses);
          } catch(e) {
              console.error("Failed to fetch courses", e);
          } finally {
              setLoading(false);
          }
      }
      fetchCoursesData();
  }, []);


  // Mocking enrolled courses with progress for demonstration
  const inProgressCourses = allCourses.slice(0, 3).map((course, index) => ({
    ...course,
    progress: [70, 45, 90, 25][index % 4],
    lastViewed: ['Today', '2 days ago', 'Yesterday', '1 week ago'][index % 4],
  }));

  const completedCourses = allCourses.slice(3, 5).map((course, index) => ({
      ...course,
      progress: 100,
      completedDate: ['2024-05-15', '2024-06-01'][index % 2],
  }));
  
  const wishlistedCourses = allCourses.filter(course => course.isWishlisted);

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
            <h1 className="font-headline text-3xl font-bold tracking-tight">স্বাগতম, Student Name!</h1>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.map((course) => (
                <EnrolledCourseCard key={course.id} course={course} status="in-progress" />
              ))}
            </div>
        </section>

        <section>
            <h2 className="font-headline text-2xl font-bold mb-4">সম্প্রতি সম্পন্ন কোর্সসমূহ</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedCourses.map((course) => (
                <EnrolledCourseCard key={course.id} course={course} status="completed" />
              ))}
            </div>
        </section>

        <section>
            <h2 className="font-headline text-2xl font-bold mb-4">উইশলিস্টে থাকা কোর্স</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wishlistedCourses.map((course) => (
                <EnrolledCourseCard key={course.id} course={course} status="wishlisted" />
              ))}
            </div>
        </section>
    </div>
  );
}
