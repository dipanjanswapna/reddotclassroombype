
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
    { href: `/student/my-courses/${courseId}/doubt-solve`, label: 'Doubt', icon: HelpCircle },
    { href: `/student/my-courses/${courseId}/quizzes`, label: 'Quiz', icon: HelpCircle },
    { href: `/student/my-courses/${courseId}/assignments`, label: 'Task', icon: FileText },
    { href: `/student/my-courses/${courseId}/exams`, label: 'Exam', icon: ClipboardEdit },
    { href: `/student/my-courses/${courseId}/live-classes`, label: 'Live', icon: Video },
    { href: `/student/my-courses/${courseId}/announcements`, label: 'Notice', icon: Megaphone },
    { href: `/student/my-courses/${courseId}/community`, label: 'Group', icon: Users },
    { href: `/student/my-courses/${courseId}/reviews`, label: 'Review', icon: Star },
    { href: `/student/my-courses/${courseId}/attendance`, label: 'Attend', icon: CalendarCheck },
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
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-4 right-4 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-2xl border border-primary/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] h-16 rounded-2xl flex justify-center overflow-hidden"
    >
      <div className="flex justify-start md:justify-center items-center h-full w-full max-w-full overflow-x-auto no-scrollbar scroll-smooth gap-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[72px] md:min-w-[90px] h-full text-center transition-all duration-300 relative px-1",
              getIsActive(item.href)
                ? "text-primary scale-105"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {getIsActive(item.href) && (
              <motion.div 
                layoutId="active-nav-pill-course"
                className="absolute inset-x-1 inset-y-2 bg-primary/10 rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "text-primary" : "")} />
            <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
