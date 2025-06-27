'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Star,
  Video,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { courses } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

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
    { href: `/student/my-courses/${course.id}`, label: 'Course Home', icon: LayoutDashboard, exact: true },
    { href: `/student/my-courses/${course.id}/lessons`, label: 'Lessons', icon: BookCopy },
    { href: `/student/my-courses/${course.id}/quizzes`, label: 'Quizzes', icon: HelpCircle },
    { href: `/student/my-courses/${course.id}/assignments`, label: 'Assignments', icon: FileText },
    { href: `/student/my-courses/${course.id}/live-classes`, label: 'Live Classes', icon: Video },
    { href: `/student/my-courses/${course.id}/announcements`, label: 'Announcements', icon: Megaphone },
    { href: `/student/my-courses/${course.id}/community`, label: 'Community', icon: MessageSquare },
    { href: `/student/my-courses/${course.id}/reviews`, label: 'Reviews', icon: Star },
  ];
  
  // The main /student/my-courses/[courseId] page is the lesson list, so we map the href to that.
  const getIsActive = (item: typeof courseNavItems[0]) => {
      if (item.href.endsWith('lessons')) {
          return pathname === `/student/my-courses/${course.id}` || pathname.startsWith(item.href)
      }
      return pathname.startsWith(item.href);
  }


  return (
    <SidebarProvider>
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar>
          <SidebarHeader>
            <div className="p-2">
                <h2 className="font-semibold text-base">{course.title}</h2>
                <p className="text-xs text-muted-foreground">by {course.instructor.name}</p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {courseNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={getIsActive(item)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <div className="p-4 sm:p-6 lg:p-8">
             {children}
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
