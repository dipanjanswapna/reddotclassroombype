
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Video, HelpCircle, BookMarked, Trophy, Heart, Wallet, User, MessageSquare, LogOut, FileCheck2, Settings, Share2, Gift, Wrench
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userInfo?.role !== 'Student') {
        router.push('/login');
      }
    }
  }, [user, userInfo, loading, router]);

  if (loading || !user || userInfo?.role !== 'Student') {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const navItems = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Home", color: "text-blue-500" },
    { href: "/student/my-courses", icon: BookOpen, label: "Courses", color: "text-red-500" },
    { href: "/student/tools", icon: Wrench, label: "Tools", color: "text-pink-500" },
    { href: "/student/planner", icon: BookMarked, label: "Planner", color: "text-emerald-500" },
    { href: "/student/live-classes", icon: Video, label: "Live", color: "text-orange-500" },
    { href: "/student/referrals", icon: Share2, label: "Refer", color: "text-indigo-500" },
    { href: "/student/rewards", icon: Gift, label: "Rewards", color: "text-amber-500" },
    { href: "/student/wishlist", icon: Heart, label: "Saved", color: "text-rose-400" },
    { href: "/student/payments", icon: Wallet, label: "Billing", color: "text-cyan-500" },
    { href: "/student/profile", icon: User, label: "Profile", color: "text-blue-400" },
    { href: "/student/tickets", icon: MessageSquare, label: "Support", color: "text-teal-500" },
    { href: "/", icon: LogOut, label: "Exit", color: "text-destructive" },
  ];
  
  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard') || href.endsWith('/my-courses')) {
        return pathname === href;
    }
    if (href === '/') return false;
    return pathname.startsWith(href);
  };
  
  const isCourseSubPage = pathname.startsWith('/student/my-courses/') && pathname.split('/').length > 3;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-background">
      <main className={cn(
        "flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden", 
        isCourseSubPage ? "pb-36" : "pb-24"
      )}>
        <div className="container max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      
      {!isCourseSubPage && (
        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 dark:bg-card/95 backdrop-blur-xl border-t border-black/5 dark:border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] h-16 px-2 flex justify-center overflow-hidden"
        >
          <div className="flex justify-start md:justify-center items-center h-full w-full max-w-7xl overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[68px] md:min-w-[85px] h-full text-center transition-all duration-300 relative px-1",
                    getIsActive(item.href)
                      ? "text-primary scale-105"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {getIsActive(item.href) && (
                  <motion.div 
                    layoutId="active-nav-pill-student"
                    className="absolute inset-x-1 inset-y-2 bg-primary/10 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {getIsActive(item.href) && (
                  <motion.div 
                    layoutId="active-nav-line-student"
                    className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                  />
                )}
                <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "text-primary" : item.color)} />
                <span className="text-[9px] font-black uppercase tracking-tight whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.nav>
      )}
    </div>
  );
}
