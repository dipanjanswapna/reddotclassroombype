
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, QrCode, PhoneCall, FileScan, Ticket, User, Badge, LogOut
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userInfo?.role !== 'Moderator') {
        router.push('/login');
      }
    }
  }, [user, userInfo, loading, router]);
  
  if (loading || !user || userInfo?.role !== 'Moderator') {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const menuItems = [
    { href: "/moderator/dashboard", icon: LayoutDashboard, label: "Home", color: "text-blue-500" },
    { href: "/moderator/scan-attendance", icon: QrCode, label: "Scan", color: "text-pink-500" },
    { href: "/moderator/absent-students", icon: PhoneCall, label: "Calls", color: "text-orange-500" },
    { href: "/moderator/content-review", icon: FileScan, label: "Review", color: "text-red-500" },
    { href: "/moderator/support-tickets", icon: Ticket, label: "Tickets", color: "text-amber-500" },
    { href: "/moderator/profile", icon: User, label: "Profile", color: "text-blue-400" },
    { href: "/moderator/id-card", icon: Badge, label: "ID Card", color: "text-indigo-500" },
    { href: "/", icon: LogOut, label: "Logout", color: "text-destructive" },
  ];

  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard')) return pathname === href;
    if (href === '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 overflow-x-hidden">
        <div className="container max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
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
                    ? "text-orange-600 scale-105"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-moderator"
                  className="absolute inset-x-1 inset-y-1.5 bg-orange-600/10 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-line-moderator"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-orange-600 rounded-full"
                />
              )}
              <item.icon className={cn("w-4 h-4", getIsActive(item.href) ? "text-orange-600" : item.color)} />
              <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}
