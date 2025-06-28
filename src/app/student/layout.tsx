
'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, BookOpen, HelpCircle, Award, Bot, User, Settings, LogOut, BarChart3, CalendarClock, GraduationCap, Library, BookMarked, MessageSquare, Users as UsersIcon, Trophy, Heart, Wallet, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/courses", icon: BookOpen, label: "My Courses" },
    { href: "/student/deadlines", icon: CalendarClock, label: "Upcoming Deadlines" },
    { href: "/student/grades", icon: GraduationCap, label: "Grades & Feedback" },
    { href: "/student/resources", icon: Library, label: "Resources Library" },
    { href: "/student/quizzes", icon: HelpCircle, label: "Interactive Quizzes" },
    { href: "/student/planner", icon: BookMarked, label: "Study Planner" },
    { href: "/student/community", icon: UsersIcon, label: "Community Forum" },
    { href: "/student/tutor", icon: Bot, label: "Virtual Tutor" },
    { href: "/student/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/student/payments", icon: Wallet, label: "Payment History" },
    { href: "/student/certificates", icon: Award, label: "Certificates" },
    { href: "/student/achievements", icon: Trophy, label: "Achievements" },
    { href: "/student/notifications", icon: Bell, label: "Notifications" },
  ];

  const footerMenuItems = [
    { href: "/student/profile", icon: User, label: "Profile & Settings" },
    { href: "/student/guardian", icon: UsersIcon, label: "Guardian Management" },
    { href: "/student/support", icon: MessageSquare, label: "Help & Support" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];
  
  return (
    <SidebarProvider>
        <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar>
          <SidebarContent className="pt-4">
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              {footerMenuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
           <div className="md:hidden flex items-center border-b p-2">
              <SidebarTrigger />
              <span className="font-semibold text-base ml-2">Student Portal</span>
            </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
