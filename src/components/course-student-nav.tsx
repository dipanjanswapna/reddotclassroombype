
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
  ClipboardEdit,
  Archive,
  CalendarCheck
} from 'lucide-react';
import { Course } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function CourseStudentNav({ course }: { course: Course }) {
  const pathname = usePathname();
  const courseId = course.id;

  const navItems = [
    { href: `/student/my-courses/${courseId}`, label: 'Lessons', icon: BookCopy },
    { href: `/student/my-courses/${courseId}/doubt-solve`, label: 'Doubt Solve', icon: HelpCircle },
    { href: `/student/my-courses/${courseId}/quizzes`, label: 'Quizzes', icon: HelpCircle },
    { href: `/student/my-courses/${courseId}/assignments`, label: 'Homework', icon: FileText },
    { href: `/student/my-courses/${courseId}/exams`, label: 'Exams', icon: ClipboardEdit },
    { href: `/student/my-courses/${courseId}/live-classes`, label: 'Live', icon: Video },
    { href: `/student/my-courses/${courseId}/announcements`, label: 'Notices', icon: Megaphone },
    { href: `/student/my-courses/${courseId}/community`, label: 'Group', icon: Users },
    { href: `/student/my-courses/${courseId}/reviews`, label: 'Feedback', icon: Star },
    { href: `/student/my-courses/${courseId}/attendance`, label: 'Attendance', icon: CalendarCheck },
    { href: `/student/my-courses/${courseId}/archive`, label: 'Archive', icon: Archive },
  ];

  const getIsActive = (href: string) => {
    if (href.endsWith(courseId!)) {
      return pathname === href || pathname.startsWith(`${href}/lesson`);
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.nav 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-14 px-2"
    >
      <div className="flex justify-start items-center h-full max-w-full overflow-x-auto no-scrollbar scroll-smooth gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-shrink-0 min-w-[70px] h-full text-center transition-all duration-300 relative",
              getIsActive(item.href)
                ? "text-primary scale-105"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {getIsActive(item.href) && (
              <motion.div 
                layoutId="active-nav-pill-course"
                className="absolute inset-x-1 inset-y-1.5 bg-primary/10 rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {getIsActive(item.href) && (
              <motion.div 
                layoutId="active-nav-line-course"
                className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
              />
            )}
            <item.icon className={cn("w-4 h-4", getIsActive(item.href) ? "text-primary" : "")} />
            <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
