
'use client';

import {
  BookCopy,
  Users,
  MessageSquare,
  LayoutDashboard,
  Video,
  DollarSign,
  User,
  Settings,
  LogOut,
  TicketPercent,
  CalendarPlus,
} from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/teacher/courses", icon: BookCopy, label: "My Courses" },
    { href: "#", icon: Users, label: "Students" },
    { href: "#", icon: MessageSquare, label: "Grading" },
    { href: "/teacher/live-classes", icon: Video, label: "Live Classes" },
    { href: "/teacher/promo-codes", icon: TicketPercent, label: "Promo Codes" },
    { href: "#", icon: CalendarPlus, label: "Pre-bookings" },
    { href: "#", icon: DollarSign, label: "Earnings" },
  ];

  const footerMenuItems = [
    { href: "#", icon: User, label: "Profile" },
    { href: "#", icon: Settings, label: "Settings" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];
  
  const getIsActive = (href: string) => {
    if (href === '/teacher/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };


  return (
    <SidebarProvider>
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage
                  src="https://placehold.co/100x100.png"
                  alt="Teacher Avatar"
                  data-ai-hint="male teacher"
                />
                <AvatarFallback>TA</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Teacher Name</span>
                <span className="text-xs text-muted-foreground">
                  teacher@rdc.com
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map(item => (
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
          <SidebarFooter>
            <SidebarMenu>
              {footerMenuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
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
              <span className="font-semibold text-base ml-2">Teacher Portal</span>
            </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
