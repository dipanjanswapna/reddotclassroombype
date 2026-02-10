
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, CalendarClock, Video, Library, HelpCircle, BookMarked, Users as UsersIcon, Trophy, Bot, Voicemail, Calculator, Heart, Wallet, Award, Bell, User, MessageSquare, LogOut, Badge, ClipboardEdit, FileCheck2, Settings, Share2, Gift
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
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/my-courses", icon: BookOpen, label: "Courses" },
    { href: "/student/planner", icon: BookMarked, label: "Planner" },
    { href: "/student/live-classes", icon: Video, label: "Live" },
    { href: "/student/quizzes", icon: HelpCircle, label: "Quizzes" },
    { href: "/student/exams", icon: ClipboardEdit, label: "Exams" },
    { href: "/student/grades", icon: FileCheck2, label: "Grades" },
    { href: "/student/referrals", icon: Share2, label: "Referrals" },
    { href: "/student/rewards", icon: Gift, label: "Rewards" },
    { href: "/student/tutor", icon: Bot, label: "AI Tutor" },
    { href: "/student/tts", icon: Voicemail, label: "TTS" },
    { href: "/student/calculator", icon: Calculator, label: "Calc" },
    { href: "/student/wishlist", icon: Heart, label: "Saved" },
    { href: "/student/payments", icon: Wallet, label: "Payments" },
    { href: "/student/profile", icon: User, label: "Profile" },
    { href: "/student/tickets", icon: MessageSquare, label: "Support" },
    { href: "/student/settings", icon: Settings, label: "System" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];
  
  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard') || href.endsWith('/my-courses')) {
        return pathname === href;
    }
    if (href === '/') {
        return false;
    }
    return pathname.startsWith(href);
  };
  
  // Custom logic for nested course sub-pages
  const isCourseSubPage = pathname.startsWith('/student/my-courses/') && pathname.split('/').length > 3;

  return (
    <div className="flex flex-col min-h-full">
      <main className={cn(
        "flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden", 
        isCourseSubPage ? "pb-28" : "pb-24"
      )}>
        <div className="container max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      
      {!isCourseSubPage && (
        <motion.nav 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-14 px-2"
        >
          <div className="flex justify-start items-center h-full max-w-full overflow-x-auto no-scrollbar scroll-smooth gap-1">
            {navItems.map((item) => (
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
                    layoutId="active-nav-pill-student"
                    className="absolute inset-x-1 inset-y-1.5 bg-primary/10 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {getIsActive(item.href) && (
                  <motion.div 
                    layoutId="active-nav-line-student"
                    className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                  />
                )}
                <item.icon className={cn("w-4 h-4", getIsActive(item.href) ? "text-primary" : "")} />
                <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.nav>
      )}
    </div>
  );
}
