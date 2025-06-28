

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
  TicketPercent,
  CalendarPlus,
  Handshake,
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
import { usePathname } from 'next/navigation';
import React from 'react';
import { RdcLogo } from '@/components/rdc-logo';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menuItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/homepage", icon: Home, label: "Homepage" },
        { href: "/admin/users", icon: Users, label: "User Management" },
        { href: "/admin/partners", icon: Handshake, label: "Partner Management" },
        { href: "/admin/courses", icon: BookCopy, label: "Course Management" },
        { href: "/admin/teachers", icon: UserCog, label: "Teacher Management" },
        { href: "/admin/promo-codes", icon: TicketPercent, label: "Promo Codes" },
        { href: "#", icon: CalendarPlus, label: "Pre-bookings" },
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
        <Sidebar collapsible="icon">
          <SidebarHeader>
             <div className="p-2 flex items-center justify-between">
                <RdcLogo className="h-7 w-auto group-data-[collapsible=icon]:hidden" />
                <SidebarTrigger className="hidden md:flex" />
             </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
               {menuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
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
                  <SidebarMenuButton asChild tooltip={item.label}>
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
