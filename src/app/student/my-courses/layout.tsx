
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
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
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
    { href: `/student/my-courses/${course.id}`, label: 'Lessons', icon: BookCopy },
    { href: `/student/my-courses/${course.id}/quizzes`, label: 'Quizzes', icon: HelpCircle },
    { href: `/student/my-courses/${course.id}/assignments`, label: 'Assignments', icon: FileText },
    { href: `/student/my-courses/${course.id}/live-classes`, label: 'Live Classes', icon: Video },
    { href: `/student/my-courses/${course.id}/announcements`, label: 'Announcements', icon: Megaphone },
    { href: `/student/my-courses/${course.id}/community`, label: 'Community', icon: Users },
    { href: `/student/my-courses/${course.id}/reviews`, label: 'Reviews', icon: Star },
  ];
  
  if (course.includedArchivedCourseIds && course.includedArchivedCourseIds.length > 0) {
    courseNavItems.push({ href: `/student/my-courses/${course.id}/archive`, label: 'Archived Content', icon: Archive });
  }
  
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
          <SidebarContent className="pt-4">
            <div className="px-2 pb-2">
                <h2 className="font-semibold text-base truncate">{course.title}</h2>
                <p className="text-xs text-muted-foreground">by {course.instructors?.[0]?.name || 'RDC Instructor'}</p>
            </div>
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
            <div className="md:hidden flex items-center justify-start border-b p-2 bg-background z-10 sticky top-16">
                <SidebarTrigger />
                <h2 className="font-semibold text-base truncate ml-2">{course.title}</h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
