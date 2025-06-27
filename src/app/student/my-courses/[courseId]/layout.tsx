
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  FileText,
  HelpCircle,
  Megaphone,
  MessageSquare,
  Star,
  Users,
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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { courses } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
  
  const getIsActive = (href: string) => {
    // 'Lessons' is special: it's active for the course root AND any lesson detail page.
    if (href.endsWith(params.courseId)) {
        return pathname === href || pathname.startsWith(`${href}/lesson`);
    }
    // All other links just need an exact match for now.
    return pathname === href;
  };


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
                  <SidebarMenuButton asChild isActive={getIsActive(item.href)}>
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
            <div className="md:hidden flex items-center justify-between border-b p-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h2 className="font-semibold text-base truncate">{course.title}</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
             <div className="max-w-5xl mx-auto">
                {children}
              </div>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
