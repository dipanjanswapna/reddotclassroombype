"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, HelpCircle, BookMarked, Heart, Wallet, User, MessageSquare, LogOut, Wrench, Share2, Gift, Video
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

/**
 * @fileOverview Student Layout refined with Geometric Standards and Sentence Case labels.
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading, logout } = useAuth();
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
        <div className="flex items-center justify-center h-screen bg-background">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const navItems = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/student/my-courses", icon: BookOpen, label: "My Courses" },
    { href: "/student/tools", icon: Wrench, label: "Learning Tools" },
    { href: "/student/planner", icon: BookMarked, label: "Study Planner" },
    { href: "/student/live-classes", icon: Video, label: "Live Classes" },
    { href: "/student/referrals", icon: Share2, label: "Refer & Earn" },
    { href: "/student/rewards", icon: Gift, label: "My Rewards" },
    { href: "/student/wishlist", icon: Heart, label: "Saved Courses" },
    { href: "/student/payments", icon: Wallet, label: "Billing" },
    { href: "/student/profile", icon: User, label: "Profile" },
    { href: "/student/tickets", icon: MessageSquare, label: "Support" },
    { href: "/", icon: LogOut, label: "Logout", action: logout },
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
        "flex-1 px-1 pt-20 overflow-x-hidden", 
        isCourseSubPage ? "pb-36" : "pb-28"
      )}>
        <div className="w-full max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      
      {!isCourseSubPage && (
        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 bg-white/90 dark:bg-card/90 backdrop-blur-xl border border-border shadow-xl h-16 rounded-[20px] flex justify-center overflow-hidden"
        >
          <div className="flex justify-start md:justify-center items-center h-full w-full max-w-full overflow-x-auto no-scrollbar scroll-smooth gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.action}
                className={cn(
                    "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[85px] h-full text-center transition-all duration-300 relative px-1",
                    getIsActive(item.href)
                      ? "text-primary"
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
                <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "text-primary" : "")} />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-tight whitespace-nowrap",
                  getIsActive(item.href) ? "text-primary" : "text-muted-foreground"
                )}>{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.nav>
      )}
    </div>
  );
}