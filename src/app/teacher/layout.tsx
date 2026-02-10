
"use client";

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
  Badge,
  ClipboardCheck,
  QrCode,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userInfo?.role !== 'Teacher') {
        router.push('/login');
      }
    }
  }, [user, userInfo, loading, router]);
  
  if (loading || !user || userInfo?.role !== 'Teacher') {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const menuItems = [
    { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/teacher/courses", icon: BookCopy, label: "Courses" },
    { href: "/teacher/students", icon: Users, label: "Students" },
    { href: "/teacher/grading", icon: FileCheck2, label: "Grading" },
    { href: "/teacher/attendance", icon: ClipboardCheck, label: "Log" },
    { href: "/teacher/scan-attendance", icon: QrCode, label: "Scan" },
    { href: "/teacher/live-classes", icon: Video, label: "Live" },
    { href: "/teacher/promo-codes", icon: TicketPercent, label: "Promos" },
    { href: "/teacher/earnings", icon: DollarSign, label: "Sales" },
    { href: "/teacher/profile", icon: User, label: "Profile" },
    { href: "/teacher/id-card", icon: Badge, label: "ID Card" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];
  
  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard')) {
        return pathname === href;
    }
    if (href === '/') {
        return false;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20">
        {children}
      </main>
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-14 px-2"
      >
        <div className="flex justify-start items-center h-full max-w-full overflow-x-auto no-scrollbar scroll-smooth gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-shrink-0 min-w-[70px] h-full text-center transition-all duration-300 relative",
                  getIsActive(item.href)
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-teacher"
                  className="absolute inset-x-1 inset-y-1.5 bg-primary/10 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-line-teacher"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                />
              )}
              <item.icon className={cn("w-4 h-4", getIsActive(item.href) ? "text-primary" : "")} />
              <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}
