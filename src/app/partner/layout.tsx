
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  BookCopy,
  Users as UsersIcon,
  BarChart3,
  Paintbrush,
  Banknote
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
import { organizations } from '@/lib/mock-data';

// Mocking the current partner for demo purposes
const currentPartner = organizations[0];

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/partner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/partner/courses", icon: BookCopy, label: "Courses" },
    { href: "/partner/teachers", icon: UsersIcon, label: "Teachers" },
    { href: "/partner/students", icon: UsersIcon, label: "Students" },
    { href: "/partner/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/partner/payouts", icon: Banknote, label: "Payouts" },
    { href: "/partner/branding", icon: Paintbrush, label: "Branding" },
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
                  src={currentPartner.logoUrl}
                  alt={currentPartner.name}
                />
                <AvatarFallback>{currentPartner.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{currentPartner.name}</span>
                <span className="text-xs text-muted-foreground">
                  partner@rdc.com
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
              <span className="font-semibold text-base ml-2">Partner Portal</span>
            </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
