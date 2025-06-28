'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  FileText,
  HelpCircle,
  Megaphone,
  Star,
  Users,
  Video,
  Archive,
} from 'lucide-react';
import { courses } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) {
  const pathname = usePathname();
  const course = courses.find((c) => c.id === params.courseId);

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
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20">
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
    </div>
  );
}
