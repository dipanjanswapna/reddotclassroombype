
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User, BookOpen, BarChart3, Wallet, MessageSquare, LayoutDashboard, Badge, ClipboardCheck, LogOut
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userInfo?.role !== 'Guardian') {
        router.push('/login');
      }
    }
  }, [user, userInfo, loading, router]);
  
  if (loading || !user || userInfo?.role !== 'Guardian') {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const menuItems = [
    { href: "/guardian/dashboard", icon: LayoutDashboard, label: "Home", color: "text-blue-500" },
    { href: "/guardian/progress", icon: BarChart3, label: "Grades", color: "text-green-500" },
    { href: "/guardian/courses", icon: BookOpen, label: "Courses", color: "text-red-500" },
    { href: "/guardian/attendance", icon: ClipboardCheck, label: "Attend", color: "text-orange-500" },
    { href: "/guardian/payment-history", icon: Wallet, label: "Billing", color: "text-emerald-500" },
    { href: "/guardian/contact-teachers", icon: MessageSquare, label: "Contact", color: "text-amber-500" },
    { href: "/guardian/profile", icon: User, label: "Profile", color: "text-blue-400" },
    { href: "/guardian/id-card", icon: Badge, label: "ID Card", color: "text-indigo-500" },
    { href: "/", icon: LogOut, label: "Logout", color: "text-destructive" },
  ];

  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard')) return pathname === href;
    if (href === '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-32 overflow-x-hidden">
        <div className="container max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 dark:bg-card/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] h-16 md:h-20 px-2 flex justify-center"
      >
        <div className="flex justify-start md:justify-center items-center h-full w-full max-w-7xl overflow-x-auto no-scrollbar scroll-smooth gap-1 md:gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[75px] md:min-w-[90px] h-full text-center transition-all duration-300 relative px-1",
                  getIsActive(item.href)
                    ? "text-purple-600 scale-105"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-guardian"
                  className="absolute inset-x-1 inset-y-2 md:inset-y-3 bg-purple-600/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-line-guardian"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-purple-600 rounded-full"
                />
              )}
              <item.icon className={cn("w-5 h-5 md:w-6 md:h-6", getIsActive(item.href) ? "text-purple-600" : item.color)} />
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}
