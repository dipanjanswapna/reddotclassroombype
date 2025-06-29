
'use client';

import React from 'react';
import { getCourse } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { notFound, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookCopy, FileText, HelpCircle, Megaphone, Star, Users, Video, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

// New Course-Specific Layout Component
function CourseSpecificLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) {
  const pathname = usePathname();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourse(params.courseId);
        setCourse(courseData);
      } catch (err) {
        console.error("Failed to fetch course for layout", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [params.courseId]);

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center h-full w-full p-8">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (!course) {
    notFound();
  }
  
  const courseNavItems = [
    { href: `/student/my-courses/${course.id}`, label: 'Lessons', icon: BookCopy },
    { href: `/student/my-courses/${course.id}/quizzes`, label: 'Quizzes', icon: HelpCircle },
    { href: `/student/my-courses/${course.id}/assignments`, label: 'Assignments', icon: FileText },
    { href: `/student/my-courses/${course.id}/live-classes`, label: 'Live Classes', icon: Video },
    { href: `/student/my-courses/${course.id}/announcements`, label: 'Announcements', icon: Megaphone },
    { href: `/student/my-courses/${course.id}/community`, label: 'Community', icon: Users },
    { href: `/student/my-courses/${course.id}/reviews`, label: 'Reviews', icon: Star },
  ];
  
  if (course.includedArchivedCourseIds && course.includedArchivedCourseIds.length > 0) {
    courseNavItems.push({ href: `/student/my-courses/${course.id}/archive`, label: 'Archive', icon: Archive });
  }
  
  const getIsActive = (href: string) => {
    // For the main course page (Lessons), check for exact match or if it's a lesson detail page
    if (href.endsWith(params.courseId)) {
      return pathname === href || pathname.startsWith(`${href}/lesson`);
    }
    // For all other nested pages, a simple `startsWith` check is enough to keep the parent link active.
    return pathname.startsWith(href);
  };


  return (
    <>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t">
        <div className="container mx-auto flex justify-start items-center space-x-1 overflow-x-auto p-1">
          {courseNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 p-2 w-24 h-16 text-center transition-colors rounded-md",
                  getIsActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}


// This is the main layout for the /student/my-courses directory.
// It will conditionally render either its children directly (for the main page)
// or the CourseSpecificLayout (for nested course pages).
export default function MyCoursesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId?: string }; // courseId is optional here
}) {
  const pathname = usePathname();
  const isCourseSpecificPage = /^\/student\/my-courses\/.+/.test(pathname);

  if (isCourseSpecificPage && params.courseId) {
    return <CourseSpecificLayout params={{ courseId: params.courseId }}>{children}</CourseSpecificLayout>;
  }

  // If not a course-specific page (i.e., /student/my-courses), just render children
  // which will be page.tsx, and the main student layout will provide the nav.
  return <>{children}</>;
}
