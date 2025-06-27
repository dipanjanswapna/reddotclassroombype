
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  BookOpen,
  BarChart3,
  Wallet,
  MessageSquare,
  LayoutDashboard,
  Settings,
  LogOut,
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
import React from 'react';

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/guardian/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "#", icon: BarChart3, label: "Child's Progress" },
    { href: "#", icon: BookOpen, label: "Enrolled Courses" },
    { href: "#", icon: Wallet, label: "Payment History" },
    { href: "#", icon: MessageSquare, label: "Contact Teachers" },
  ];

  const footerMenuItems = [
    { href: "#", icon: User, label: "Profile" },
    { href: "#", icon: Settings, label: "Settings" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];

  return (
    <SidebarProvider>
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage
                  src="https://placehold.co/100x100.png"
                  alt="Guardian Avatar"
                  data-ai-hint="parent"
                />
                <AvatarFallback>GA</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Guardian Name</span>
                <span className="text-xs text-muted-foreground">
                  guardian@rdc.com
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              {footerMenuItems.map((item) => (
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
              <span className="font-semibold text-base ml-2">Guardian Portal</span>
            </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
