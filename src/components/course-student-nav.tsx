
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
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-4 right-4 z-40 bg-background/70 dark:bg-card/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-1 overflow-hidden"
    >
      <div className="flex justify-start items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 flex-shrink-0 p-2 w-20 h-16 text-center transition-all duration-300 rounded-xl relative",
              getIsActive(item.href)
                ? "text-primary-foreground scale-105"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            {getIsActive(item.href) && (
              <motion.div 
                layoutId="active-pill-course-nav"
                className="absolute inset-0 bg-primary shadow-lg shadow-primary/30 rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "animate-pulse" : "")} />
            <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
