

'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  Bot,
  User,
  Settings,
  LogOut,
  BarChart3,
  CalendarClock,
  GraduationCap,
  Library,
  BookMarked,
  MessageSquare,
  Users as UsersIcon,
  Trophy,
  Heart,
  Wallet,
  Bell,
  Crown,
  Video,
  Voicemail,
  Calculator,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { RdcLogo } from '@/components/rdc-logo';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const mainItems = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/my-courses", icon: BookOpen, label: "My Courses" },
  ];

  const academicItems = [
    { href: "/student/deadlines", icon: CalendarClock, label: "Deadlines" },
    { href: "/student/grades", icon: GraduationCap, label: "Grades" },
    { href: "/student/live-classes", icon: Video, label: "Live Classes" },
    { href: "/student/resources", icon: Library, label: "Resources" },
    { href: "/student/quizzes", icon: HelpCircle, label: "Quizzes" },
    { href: "/student/planner", icon: BookMarked, label: "Study Planner" },
  ];

  const engagementItems = [
    { href: "/student/community", icon: UsersIcon, label: "Community" },
    { href: "/student/leaderboard", icon: Crown, label: "Leaderboard" },
    { href: "/student/achievements", icon: Trophy, label: "Achievements" },
    { href: "/student/tutor", icon: Bot, label: "Virtual Tutor" },
    { href: "/student/tts", icon: Voicemail, label: "Text to Speech" },
    { href: "/student/calculator", icon: Calculator, label: "Calculator" },
  ];
  
  const accountItems = [
     { href: "/student/wishlist", icon: Heart, label: "Wishlist" },
     { href: "/student/payments", icon: Wallet, label: "Payments" },
     { href: "/student/certificates", icon: Award, label: "Certificates" },
     { href: "/student/notifications", icon: Bell, label: "Notifications" },
  ];

  const footerMenuItems = [
    { href: "/student/profile", icon: User, label: "Profile & Settings" },
    { href: "/student/guardian", icon: UsersIcon, label: "Guardian" },
    { href: "/student/tickets", icon: MessageSquare, label: "Support" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];
  
  const getIsActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/student/dashboard') {
        return pathname === href;
    }
    // Starts with for sections
    return pathname.startsWith(href);
  };
  
  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu className='p-2 pt-0'>
      {items.map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={getIsActive(item.href)} tooltip={item.label}>
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <SidebarProvider>
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar collapsible="icon">
          <SidebarHeader>
             <div className="p-2 flex items-center justify-between">
                <RdcLogo className="h-7 w-auto group-data-[collapsible=icon]:hidden" />
                <SidebarTrigger className="hidden md:flex" />
             </div>
          </SidebarHeader>
          <SidebarContent className="flex flex-col">
            <SidebarGroup>
                {renderMenuItems(mainItems)}
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupLabel className='px-4 mb-1'>Academics</SidebarGroupLabel>
                {renderMenuItems(academicItems)}
            </SidebarGroup>
             <SidebarGroup>
                <SidebarGroupLabel className='px-4 mb-1'>Engagement</SidebarGroupLabel>
                {renderMenuItems(engagementItems)}
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupLabel className='px-4 mb-1'>Account</SidebarGroupLabel>
                {renderMenuItems(accountItems)}
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              {footerMenuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
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
