
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
  Video
} from 'lucide-react';
import { Course } from '@/lib/types';
import { cn } from '@/lib/utils';

export function CourseStudentNav({ course }: { course: Course }) {
  const pathname = usePathname();
  const courseId = course.id;

  const navItems = [
    { href: `/student/my-courses/${courseId}`, label: 'Lessons', icon: BookCopy },
    { href: `/student/my-courses/${courseId}/doubt-solve`, label: 'Doubt Solve', icon: HelpCircle },
    { href: `/student/my-courses/${courseId}/quizzes`, label: 'Quizzes', icon: HelpCircle },
    { href: `/student/my-courses/${courseId}/assignments`, label: 'Assignments', icon: FileText },
    { href: `/student/my-courses/${courseId}/live-classes`, label: 'Live Classes', icon: Video },
    { href: `/student/my-courses/${courseId}/announcements`, label: 'Announcements', icon: Megaphone },
    { href: `/student/my-courses/${courseId}/community`, label: 'Community', icon: Users },
    { href: `/student/my-courses/${courseId}/reviews`, label: 'Reviews', icon: Star },
  ];

  const getIsActive = (href: string) => {
    if (href.endsWith(courseId!)) {
      return pathname === href || pathname.startsWith(`${href}/lesson`);
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t">
      <div className="container mx-auto flex justify-start items-center space-x-1 overflow-x-auto p-1">
        {navItems.map((item) => (
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
  );
}
