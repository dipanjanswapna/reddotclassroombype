
'use client';

import {
  BookCopy,
  Users,
  LayoutDashboard,
  Video,
  DollarSign,
  User,
  Settings,
  LogOut,
  TicketPercent,
  CalendarPlus,
  FileCheck2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/teacher/courses", icon: BookCopy, label: "Courses" },
    { href: "/teacher/students", icon: Users, label: "Students" },
    { href: "/teacher/grading", icon: FileCheck2, label: "Grading" },
    { href: "/teacher/live-classes", icon: Video, label: "Live Classes" },
    { href: "/teacher/promo-codes", icon: TicketPercent, label: "Promo Codes" },
    { href: "/teacher/pre-bookings", icon: CalendarPlus, label: "Pre-bookings" },
    { href: "/teacher/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/teacher/profile", icon: User, label: "Profile" },
    { href: "/teacher/settings", icon: Settings, label: "Settings" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];
  
  const getIsActive = (href: string) => {
    if (href === '/teacher/dashboard') {
        return pathname === href;
    }
     // De-dupe / from the end of the href
    const newHref = href.endsWith('/') ? href.slice(0, -1) : href;
    if (newHref === '') return false; // Don't match the root logout button
    return pathname.startsWith(href);
  };

  return (
    <>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t">
        <div className="container mx-auto flex justify-start items-center space-x-1 overflow-x-auto p-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 p-2 w-24 h-16 text-center transition-colors rounded-md",
                  getIsActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
