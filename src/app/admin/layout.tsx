
'use client';

import Link from 'next/link';
import {
  Users,
  BookCopy,
  UserCog,
  AreaChart,
  Settings,
  LogOut,
  LayoutDashboard,
  DollarSign,
  Home,
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
import React from 'react';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menuItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/homepage", icon: Home, label: "Homepage" },
        { href: "#", icon: Users, label: "User Management" },
        { href: "/admin/courses", icon: BookCopy, label: "Course Management" },
        { href: "/admin/teachers", icon: UserCog, label: "Teacher Management" },
        { href: "#", icon: DollarSign, label: "Financials" },
        { href: "#", icon: AreaChart, label: "Reports" },
    ];

    const footerMenuItems = [
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
                  alt="Admin Avatar"
                  data-ai-hint="administrator"
                />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Admin Name</span>
                <span className="text-xs text-muted-foreground">
                  admin@rdc.com
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
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
              <span className="font-semibold text-base ml-2">Admin Portal</span>
            </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
